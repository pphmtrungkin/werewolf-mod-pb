import pocketbase from "../pocketbase";

let heartbeatInterval;
let currentLobbyPlayerId;

export function startHeartbeat(lobbyPlayerId, clearInterval) {
  currentLobbyPlayerId = lobbyPlayerId;
}

export function stopHeartbeat() {
  clearInterval(heartbeatInterval);
}
export function setCurrentLobbyPlayerId(id) {
  currentLobbyPlayerId = id;
}
