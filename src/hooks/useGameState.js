import { useState, useEffect, useCallback } from "react";
import pbService from "../services/pbService";

export default function useGameState(gameId, user) {
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRoleKey = useCallback(
    (role) =>
      String(role || "villager")
        .trim()
        .toLowerCase(),
    [],
  );

  const initializeGame = useCallback(async () => {
    if (!gameId) {return;}

    try {
      setLoading(true);
      setError(null);

      const [gameData, playersData, cardsData] = await Promise.all([
        pbService.getGameById(gameId, { expand: "deck" }),
        pbService.getGamePlayers(gameId),
        pbService.getCards(),
      ]);

      setGame(gameData);
      setPlayers(playersData);
      setCards(cardsData);

      if (gameData && gameData.current_night) {
        const entriesData = await pbService.getModeratorEntriesByGameAndNight(
          gameData.id,
          gameData.current_night,
        );
        setEntries(entriesData);
      }
    } catch (err) {
      console.error("Error initializing game:", err);
      setError("Failed to load game data");
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) {return;}
    let mounted = true;

    const setupSubscriptions = async () => {
      try {
        await pbService.subscribeGame(gameId, (e) => {
          if (!mounted) {return;}
          const record = e?.record;
          if (record) {
            setGame(record);
          }
        });

        await pbService.subscribeModeratorEntries(gameId, async () => {
          if (!mounted) {return;}
          const currentGame = game;
          if (currentGame?.current_night) {
            try {
              const entriesData = await pbService.getModeratorEntriesByGameAndNight(
                currentGame.id,
                currentGame.current_night,
              );
              setEntries(entriesData);
            } catch (err) {
              console.error("Error refreshing moderator entries:", err);
            }
          }
        });
      } catch (err) {
        console.error("Error setting up subscriptions:", err);
      }
    };

    setupSubscriptions();

    return () => {
      mounted = false;
      try {
        pbService.unsubscribeGame(gameId);
        pbService.unsubscribeModeratorEntries();
      } catch (err) {
        console.error("Error cleaning up subscriptions:", err);
      }
    };
  }, [gameId, game?.current_night, game]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const getCurrentPlayer = useCallback(() => {
    if (!user || !players.length) {return null;}
    return players.find((p) => p.player === user.name);
  }, [user, players]);

  const getPlayerById = useCallback(
    (playerId) => {
      return players.find((p) => p.id === playerId);
    },
    [players],
  );

  const getRoleActions = useCallback(
    (role) => {
      if (!role || !cards.length) {return ["view"];}
      const card = cards.find((c) => c.title?.toLowerCase() === role?.toLowerCase());
      if (card && card.actions) {
        return Array.isArray(card.actions) ? card.actions : [card.actions];
      }
      return ["view"];
    },
    [cards],
  );

  const getPlayersInActionOrder = useCallback(() => {
    if (!players.length || !cards.length) {return [];}

    return players
      .map((player) => {
        const card = cards.find((c) => c.title?.toLowerCase() === player.role?.toLowerCase());
        return {
          ...player,
          actionOrder: card?.card_order || 999,
        };
      })
      .sort((a, b) => a.actionOrder - b.actionOrder);
  }, [players, cards]);

  const hasRoleEntry = useCallback(
    (roleKey, phase, nightNumber) => {
      if (!entries.length) {return false;}
      return entries.some((e) => {
        const matchesNight = nightNumber ? e.night_number === nightNumber : true;
        const matchesPhase = phase ? e.phase === phase : true;
        const matchesRole = roleKey ? String(e.role_key || "").toLowerCase() === roleKey : true;
        const hasHolder = !!e.holder;
        return matchesNight && matchesPhase && matchesRole && hasHolder;
      });
    },
    [entries],
  );

  const getCurrentActivePlayer = useCallback(() => {
    if (!game || game.phase !== "night") {return null;}

    const orderedPlayers = getPlayersInActionOrder();

    for (const player of orderedPlayers) {
      const roleKey = getRoleKey(player.role || "villager");
      if (!hasRoleEntry(roleKey, "night", game.current_night)) {
        return player;
      }
    }

    return null;
  }, [game, getPlayersInActionOrder, hasRoleEntry, getRoleKey]);

  const hasPlayerActed = useCallback(
    (playerId, phase = null, nightNumber = null) => {
      if (!entries.length) {return false;}

      if (phase === "night") {
        const p = getPlayerById(playerId);
        const roleKey = getRoleKey(p?.role || "villager");
        return hasRoleEntry(roleKey, "night", nightNumber);
      }

      if (phase === "voting") {
        return entries.some((e) => {
          const matchesNight = nightNumber ? e.night_number === nightNumber : true;
          const matchesPhase = e.phase === "voting";
          const matchesRole = String(e.role_key || "").toLowerCase() === "vote";
          const matchesHolder = e.holder === playerId;
          return matchesNight && matchesPhase && matchesRole && matchesHolder;
        });
      }

      return entries.some((e) => e.holder === playerId);
    },
    [entries, getPlayerById, getRoleKey, hasRoleEntry],
  );

  const canPlayerAct = useCallback(() => {
    return false;
  }, []);

  const getSelectablePlayers = useCallback(() => {
    return [];
  }, []);

  const submitNightEntry = useCallback(
    async (roleKey, holderId, targetId, actionType = null) => {
      if (!game) {throw new Error("No game");}

      await pbService.upsertModeratorEntry({
        game: game.id,
        night_number: game.current_night || 1,
        phase: "night",
        role_key: roleKey,
        holder: holderId,
        target: targetId,
        action_type: actionType,
        created_by: user?.id || null,
      });

      return true;
    },
    [game, user?.id],
  );

  const submitVote = useCallback(
    async (voterId, targetId) => {
      if (!game) {throw new Error("No game");}

      await pbService.createModeratorEntry({
        game: game.id,
        night_number: game.current_night || 1,
        phase: "voting",
        role_key: "vote",
        holder: voterId,
        target: targetId,
        action_type: "vote",
        created_by: user?.id || null,
      });

      return true;
    },
    [game, user?.id],
  );

  const submitAction = useCallback(
    async (targetPlayer, actionType = null) => {
      const currentPlayer = getCurrentPlayer();
      if (!currentPlayer || !targetPlayer || !game) {
        throw new Error("Invalid action parameters");
      }

      if (!game.current_night && game.phase !== "waiting") {
        throw new Error("Game night not initialized");
      }

      let finalActionType = actionType;

      if (!finalActionType) {
        if (game.phase === "voting") {
          finalActionType = "vote";
        } else if (game.phase === "night") {
          const roleActions = getRoleActions(currentPlayer.role);
          finalActionType = roleActions[0] || "view";
        } else {
          throw new Error("Cannot act during current phase");
        }
      }

      try {
        if (game.phase === "night") {
          const roleKey = getRoleKey(currentPlayer.role || "villager");

          await pbService.upsertModeratorEntry({
            game: game.id,
            night_number: game.current_night || 0,
            phase: "night",
            role_key: roleKey,
            holder: currentPlayer.id,
            target: targetPlayer.id,
            action_type: finalActionType,
            created_by: user?.id || null,
          });

          return true;
        }

        if (game.phase === "voting") {
          await pbService.createModeratorEntry({
            game: game.id,
            night_number: game.current_night || 0,
            phase: "voting",
            role_key: "vote",
            holder: currentPlayer.id,
            target: targetPlayer.id,
            action_type: "vote",
            created_by: user?.id || null,
          });

          return true;
        }

        throw new Error("Unsupported phase for moderator entry");
      } catch (err) {
        console.error("Error submitting moderator entry:", err);
        throw new Error("Failed to submit action");
      }
    },
    [getCurrentPlayer, game, getRoleActions, getRoleKey, user?.id],
  );

  const getPhaseDescription = useCallback(() => {
    if (!game) {return "";}

    switch (game.phase) {
    case "waiting":
      return "Game is starting...";
    case "night": {
      const activePlayer = getCurrentActivePlayer();
      if (activePlayer) {
        return `Moderator input needed for ${activePlayer.role || "Villager"}...`;
      }
      return "All night entries complete. Moving to day phase...";
    }
    case "day":
      return "Day phase - Discuss and prepare to vote";
    case "voting":
      return "Voting phase - Moderator enters votes";
    case "completed":
      return "Game completed";
    default:
      return "";
    }
  }, [game, getCurrentActivePlayer]);

  const getTimeRemaining = useCallback(() => {
    if (!game?.phase_timer) {return 0;}

    const now = new Date();
    const phaseEnd = new Date(game.phase_timer);
    return Math.max(0, Math.floor((phaseEnd - now) / 1000));
  }, [game?.phase_timer]);

  const startGame = useCallback(async () => {
    if (!game || game.status !== "waiting") {return;}

    try {
      await pbService.updateGame(game.id, { status: "in_progress" });
      await pbService.startNightPhase(game.id, 1);
    } catch (err) {
      console.error("Error starting game:", err);
      throw new Error("Failed to start game");
    }
  }, [game]);

  const advancePhase = useCallback(async () => {
    if (!game) {return;}

    try {
      switch (game.phase) {
      case "night":
        await pbService.startDayPhase(game.id);
        break;
      case "day":
        await pbService.startVotingPhase(game.id);
        break;
      case "voting":
        await pbService.advanceToNextNight(game.id, game.current_night);
        break;
      default:
        console.warn("Cannot advance from phase:", game.phase);
      }
    } catch (err) {
      console.error("Error advancing phase:", err);
      throw new Error("Failed to advance phase");
    }
  }, [game]);

  return {
    game,
    players,
    actions: entries,
    cards,
    loading,
    error,

    currentPlayer: getCurrentPlayer(),
    canAct: canPlayerAct(),
    selectablePlayers: getSelectablePlayers(),
    phaseDescription: getPhaseDescription(),
    timeRemaining: getTimeRemaining(),
    playersInActionOrder: getPlayersInActionOrder(),
    currentActivePlayer: getCurrentActivePlayer(),

    getPlayerById,
    getRoleActions,
    hasPlayerActed,

    submitNightEntry,
    submitVote,
    submitAction,
    startGame,
    advancePhase,

    refresh: initializeGame,
  };
}
