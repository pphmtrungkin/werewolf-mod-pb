import { useState, useEffect, useCallback } from "react";
import pbService from "../services/pbService";

/**
 * Custom hook for managing werewolf game state and flow
 */
export default function useGameState(lobbyId, user) {
  const [lobby, setLobby] = useState(null);
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [actions, setActions] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Fetch actions if game exists and is in progress
      if (gameData && gameData.current_night) {
        const actionsData = await pbService.getGameActionsByGameAndNight(
          gameData.id,
          gameData.current_night,
        );
        setActions(actionsData);
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

          // Subscribe to actions changes
          await pbService.subscribeGameActions(game.id, async (e) => {
            if (!mounted) return;

            // Refresh actions when they change
            if (game?.current_night) {
              try {
                const actionsData = await pbService.getGameActionsByGameAndNight(
                  game.id,
                  game.current_night,
                );
                setActions(actionsData);
              } catch (err) {
                console.error("Error refreshing actions:", err);
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
          pbService.unsubscribeGameActions();
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

  const getCurrentActivePlayer = useCallback(() => {
    if (!game || game.phase !== "night") return null;

    const orderedPlayers = getPlayersInActionOrder();
    const actionsCompleted = actions.filter(
      (a) => a.night_number === game.current_night && a.action_type !== "vote",
    );

    // Find first player who hasn't acted yet
    return orderedPlayers.find(
      (player) => !actionsCompleted.find((action) => action.actor === player.id),
    );
  }, [game, actions, getPlayersInActionOrder]);

  const hasPlayerActed = useCallback(
    (playerId, phase = null, nightNumber = null) => {
      if (!actions.length) return false;

      return actions.some((action) => {
        const matchesPlayer = action.actor === playerId;
        const matchesPhase = phase
          ? phase === "voting"
            ? action.action_type === "vote"
            : action.action_type !== "vote"
          : true;
        const matchesNight = nightNumber ? action.night_number === nightNumber : true;

        return matchesPlayer && matchesPhase && matchesNight;
      });
    },
    [actions],
  );

  const canPlayerAct = useCallback(() => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer || !game) return false;

    // Check if player already acted in current phase
    const alreadyActed = hasPlayerActed(currentPlayer.id, game.phase, game.current_night);
    if (alreadyActed) return false;

    // During voting phase, all players can act
    if (game.phase === "voting") return true;

    // During night phase, only current active player can act
    if (game.phase === "night") {
      const activePlayer = getCurrentActivePlayer();
      return activePlayer && activePlayer.id === currentPlayer.id;
    }

    return false;
  }, [getCurrentPlayer, game, hasPlayerActed, getCurrentActivePlayer]);

  const getSelectablePlayers = useCallback(() => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return [];

    // During voting, can vote for anyone except self
    if (game?.phase === "voting") {
      return players.filter((p) => p.id !== currentPlayer.id);
    }

    // During night, apply role-specific targeting rules
    if (game?.phase === "night") {
      // For now, simple rule: can target anyone except self
      // TODO: Implement role-specific targeting rules (e.g., bodyguard can't protect same person twice)
      return players.filter((p) => p.id !== currentPlayer.id);
    }

    return [];
  }, [getCurrentPlayer, game, players]);

  const submitAction = useCallback(
    async (targetPlayer, actionType = null) => {
      const currentPlayer = getCurrentPlayer();
      if (!currentPlayer || !targetPlayer || !game) {
        throw new Error("Invalid action parameters");
      }

      // Determine action type if not provided
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
        await pbService.createGameAction({
          game: game.id,
          actor: currentPlayer.id,
          target: targetPlayer.id,
          action_type: finalActionType,
          night_number: game.current_night || 0,
        });

        return true;
      } catch (err) {
        console.error("Error submitting action:", err);
        throw new Error("Failed to submit action");
      }
    },
    [getCurrentPlayer, game, getRoleActions],
  );

  const getPhaseDescription = useCallback(() => {
    if (!game) return "";

    switch (game.phase) {
      case "waiting":
        return "Game is starting...";
      case "night":
        const activePlayer = getCurrentActivePlayer();
        if (activePlayer) {
          const currentPlayer = getCurrentPlayer();
          if (currentPlayer && activePlayer.id === currentPlayer.id) {
            return "It's your turn to act!";
          } else {
            return `Waiting for ${activePlayer.player} to act...`;
          }
        } else {
          return "All night actions complete. Moving to day phase...";
        }
      case "day":
        return "Day phase - Discuss and prepare to vote";
      case "voting":
        return "Voting phase - Choose who to eliminate";
      case "completed":
        return "Game completed";
      default:
        return "";
    }
  }, [game, getCurrentActivePlayer, getCurrentPlayer]);

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
    actions,
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
