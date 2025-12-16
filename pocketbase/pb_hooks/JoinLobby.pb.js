/**
 * Generates a guest ID in the format 'guestXXXXXXXXXX'
 */
function generateGuestId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return "guest" + result;
}

routerAdd("POST", "/api/joinLobby", (e) => {
  const body = e.requestInfo().body ?? {};
  if (typeof body !== "object") {
    return e.json(400, { message: "Invalid request body" });
  }

  const { lobbyId, authCode, username: guestUsername, guestId } = body;

  console.log("Lobby with the code", lobbyId, authCode);

  if (!lobbyId || !authCode) {
    return e.json(400, { message: "Lobby ID and code are required." });
  }

  let lobbyRecord;
  try {
    lobbyRecord = $app.findRecordById("lobbies", lobbyId);
  } catch {
    return e.json(404, { message: "Lobby not found." });
  }

  if (authCode !== lobbyRecord.getString("code")) {
    return e.json(403, { message: "Incorrect lobby code." });
  }

  const ip = e.remoteIP();

  let userId;
  let username;

  if (e.authRecord) {
    userId = e.authRecord.id;
    username =
      e.authRecord.get("name") || e.authRecord.get("username") || "Player";
  } else {
    userId = guestId || generateGuestId();
    username = guestUsername || `Guest_${userId.slice(-4)}`;
  }

  console.log("user info: ", userId, username);

  let playerRecord = null;
  try {
    playerRecord = $app.findFirstRecordByFilter(
      "lobby_players",
      "lobby = {:lobbyId} && player_id = {:userId}",
      { lobbyId, userId },
    );
  } catch {}

  if (playerRecord) {
    playerRecord.set("connected", true);
    playerRecord.set("ip_address", ip);
    playerRecord.set("player", username);
    $app.saveRecord(playerRecord);

    return e.json(200, {
      id: playerRecord.id,
      player: username,
      connected: true,
      guest: !e.authRecord,
    });
  }

  const collection = $app.findCollectionByNameOrId("lobby_players");
  const record = new Record(collection);

  record.set("lobby", lobbyId);
  record.set("player_id", userId);
  record.set("player", username);
  record.set("ip_address", ip);
  record.set("connected", true);
  record.set("alive", true);

  $app.saveRecord(record);

  return e.json(201, {
    id: record.id,
    player: username,
    connected: true,
    guest: !e.authRecord,
  });
});
