import { useState, useEffect, useCallback } from "react";
import pbService from "../services/pbService";

/**
 * Custom hook for managing werewolf game state and flow
 *
 * Moderator is the only source of truth:
 * - All "actions" are stored in moderator_entries and entered by the moderator.
 * - Regular players do not act; the UI should generally show observer mode for them.
 */
export default function useGameState(lobbyId, user) {
  const [lobby, setLobby] = useState(null);
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [entries, setEntries] = useState([]); // moderator_entries
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

  // Initialize game data
  const initializeGame = useCallback(async () => {
    if (!lobbyId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all required data
      const [lobbyData, playersData, cardsData] = await Promise.all([
        pbService.getLobbyById(lobbyId, { expand: "deck" }),
        pbService.getLobbyPlayers(lobbyId),
        pbService.getCards(),
      ]);

      setLobby(lobbyData);
      setPlayers(playersData);
      setCards(cardsData);

      // Try to get existing game for this lobby
      const gameData = await pbService.getGameByLobby(lobbyId);
      setGame(gameData);

      // Fetch moderator entries if game exists and is in progress
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
  }, [lobbyId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!lobbyId) return;
    let mounted = true;

    const setupSubscriptions = async () => {
      try {
        // Subscribe to lobby changes
        await pbService.subscribeLobby(lobbyId, (e) => {
          if (!mounted) return;
          const record = e?.record;
          if (record) {
            setLobby(record);
          }
        });

        // Subscribe to game changes if game exists
        if (game) {
          await pbService.subscribeGame(game.id, (e) => {
            if (!mounted) return;
            const record = e?.record;
            if (record) {
              setGame(record);
            }
          });

          // Subscribe to moderator entries changes
          await pbService.subscribeModeratorEntries(game.id, async () => {
            if (!mounted) return;

            if (game?.current_night) {
              try {
                const entriesData = await pbService.getModeratorEntriesByGameAndNight(
                  game.id,
                  game.current_night,
                );
                setEntries(entriesData);
              } catch (err) {
                console.error("Error refreshing moderator entries:", err);
              }
            }
          });
        }
      } catch (err) {
        console.error("Error setting up subscriptions:", err);
      }
    };

    setupSubscriptions();

    return () => {
      mounted = false;
      try {
        pbService.unsubscribeLobby(lobbyId);
        if (game) {
          pbService.unsubscribeGame(game.id);
          pbService.unsubscribeModeratorEntries();
        }
      } catch (err) {
        console.error("Error cleaning up subscriptions:", err);
      }
    };
  }, [lobbyId, game?.id, game?.current_night]);

  // Initialize on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Helper functions
  const getCurrentPlayer = useCallback(() => {
    if (!user || !players.length) return null;
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
      if (!role || !cards.length) return ["view"];
      const card = cards.find((c) => c.title?.toLowerCase() === role?.toLowerCase());
      if (card && card.actions) {
        return Array.isArray(card.actions) ? card.actions : [card.actions];
      }
      return ["view"];
    },
    [cards],
  );

  const getPlayersInActionOrder = useCallback(() => {
    if (!players.length || !cards.length) return [];

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

  /**
   * Moderator entries model:
   * - We consider a role "complete" for a night if there is a moderator entry for:
   *   (night_number, phase="night", role_key=<role>) with a non-null holder.
   *
   * This matches the "card-by-card" moderator workflow (one entry per role/card).
   */
  const hasRoleEntry = useCallback(
    (roleKey, phase, nightNumber) => {
      if (!entries.length) return false;
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
    if (!game || game.phase !== "night") return null;

    const orderedPlayers = getPlayersInActionOrder();

    // Find first role in order that hasn't been entered yet, then return its holder (if any)
    for (const player of orderedPlayers) {
      const roleKey = getRoleKey(player.role || "villager");
      if (!hasRoleEntry(roleKey, "night", game.current_night)) {
        // No entry yet: moderator still needs to enter this role/card.
        // Return the player who *has* that role as the "active" placeholder (best-effort).
        return player;
      }
    }

    return null;
  }, [game, entries, getPlayersInActionOrder, hasRoleEntry, getRoleKey]);

  /**
   * Legacy compatibility: hasPlayerActed(playerId, ...) is now derived from moderator_entries.
   *
   * For night: player is considered "acted" if their role has a moderator night entry with holder set.
   * For voting: player is considered "acted" if there is a moderator voting entry with role_key="vote"
   * and holder=playerId (one entry per voter). If you prefer single aggregate vote entry, adjust logic.
   */
  const hasPlayerActed = useCallback(
    (playerId, phase = null, nightNumber = null) => {
      if (!entries.length) return false;

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

      // If phase is unspecified, consider acted if any entry exists where holder matches.
      return entries.some((e) => e.holder === playerId);
    },
    [entries, getPlayerById, getRoleKey, hasRoleEntry],
  );

  /**
   * Moderator is the only source of truth, so normal players should never be able to act.
   * If you later add moderator detection here, you can flip this for moderators only.
   */
  const canPlayerAct = useCallback(() => {
    return false;
  }, []);

  const getSelectablePlayers = useCallback(() => {
    // Regular players can't act; moderator UI will handle selection separately.
    return [];
  }, []);

  /**
   * submitAction now writes to moderator_entries.
   *
   * Contract:
   * - Night: caller should pass a "targetPlayer" and optionally actionType; we upsert by role_key.
   * - Voting: caller should pass a targetPlayer; we create/upsert a voter-specific entry:
   *   role_key="vote" and holder=<currentPlayer.id> so each voter is tracked.
   *
   * NOTE: This hook no longer enables player actions, but GameAdmin / moderator UI can call this.
   */
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
          // One entry per voter: role_key="vote" and holder=<voter>
          // Uniqueness in pbService.upsertModeratorEntry is per (game, night, phase, role_key),
          // so we cannot use it for per-holder voting without changing its uniqueness.
          // For now, create a new entry each time; backend/client should prevent duplicates.
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
    if (!game) return "";

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
    if (!game?.phase_timer) return 0;

    const now = new Date();
    const phaseEnd = new Date(game.phase_timer);
    return Math.max(0, Math.floor((phaseEnd - now) / 1000));
  }, [game?.phase_timer]);

  // Game flow management functions (for host/admin)
  const startGame = useCallback(async () => {
    if (!lobby || lobby.status !== "waiting") return;

    try {
      // Create game if it doesn't exist
      let gameData = game;
      if (!gameData) {
        gameData = await pbService.createGame(lobbyId, lobby.deck, lobby.moderator);
        setGame(gameData);
      }

      // Start first night phase
      await pbService.startNightPhase(gameData.id, 1);

      // Update lobby status to in_progress
      await pbService.updateLobby(lobbyId, { status: "in_progress" });
    } catch (err) {
      console.error("Error starting game:", err);
      throw new Error("Failed to start game");
    }
  }, [lobby, game, lobbyId]);

  const advancePhase = useCallback(async () => {
    if (!game) return;

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
    // State
    lobby,
    game,
    players,
    actions: entries, // expose under the old name so existing UI keeps working
    cards,
    loading,
    error,

    // Computed state
    currentPlayer: getCurrentPlayer(),
    canAct: canPlayerAct(),
    selectablePlayers: getSelectablePlayers(),
    phaseDescription: getPhaseDescription(),
    timeRemaining: getTimeRemaining(),
    playersInActionOrder: getPlayersInActionOrder(),
    currentActivePlayer: getCurrentActivePlayer(),

    // Helper functions
    getPlayerById,
    getRoleActions,
    hasPlayerActed,

    // Actions
    submitAction,
    startGame,
    advancePhase,

    // Utils
    refresh: initializeGame,
  };
}
