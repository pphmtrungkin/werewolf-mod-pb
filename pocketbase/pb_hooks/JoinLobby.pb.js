/**
 * Generates a guest ID in the format 'guestXXXXXXXXXX'
 */

routerAdd("POST", "/api/joinLobby", (e) => {
  try {
    // Generate guest ID
    function generateGuestId() {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < 10; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return "guest" + result;
    }

    // Grabbing data from body
    const requestInfo = e.requestInfo();
    const body = requestInfo.body ?? {};

    // Checking if body is an object
    if (typeof body !== "object") {
      console.error("ERROR: Invalid request body type");
      return e.json(400, { message: "Invalid request body" });
    }

    // Data extraction from body
    const { lobbyId, authCode, username } = body;
    console.log("Extracted values:", {
      lobbyId,
      authCode,
      username,
    });

    // Missing values error handling
    if (!lobbyId || !authCode) {
      console.error("ERROR: Missing required fields - lobbyId:", lobbyId, "authCode:", authCode);
      return e.json(400, { message: "Lobby ID and code are required." });
    }

    // Grabbing correct auth code from lobby record
    let lobbyRecord;
    try {
      console.log("Attempting to find lobby with ID:", lobbyId);
      lobbyRecord = $app.findRecordById("lobbies", lobbyId);
      console.log("Lobby found successfully");
    } catch (error) {
      console.error("ERROR: Lobby not found -", error.message);
      return e.json(404, { message: "Lobby not found." });
    }

    // Incorrect auth code error handling
    if (authCode !== lobbyRecord.getString("code")) {
      console.error(
        "ERROR: Incorrect lobby code - expected:",
        lobbyRecord.getString("code"),
        "got:",
        authCode,
      );
      return e.json(403, { message: "Incorrect lobby code." });
    }

    const ip = e.remoteIP();
    console.log("Client IP:", ip);

    // Grabbing user ID and username based on authentication
    let userId;
    const authUser = requestInfo.auth;

    // We will grab the user ID from auth Object if they are authenticated
    // If not, we will generate a guest ID
    if (authUser && authUser.id) {
      console.log("User is authenticated");
      userId = authUser.id;
    } else {
      userId = generateGuestId();
    }

    console.log("User Id with username:", userId, username);

    // Checking if user is already in the lobby
    let playerRecord = null;
    try {
      console.log("Searching for existing player record with filter:", { lobbyId, userId });
      playerRecord = $app.findFirstRecordByFilter(
        "lobby_players",
        "lobby = {:lobbyId} && player = {:username}",
        { lobbyId, username },
      );
      console.log("Existing player record found:", playerRecord.id);
    } catch (error) {
      // "sql: no rows in result set" is the standard "not found" error
      if (error.message && error.message.includes("no rows in result set")) {
        console.log("No existing player record found (expected for new player)");
        playerRecord = null;
      } else {
        console.error("ERROR: Unexpected error finding player:", error.message, error);
        throw error;
      }
    }

    if (playerRecord) {
      // Return not allow code because the user already exists
      return e.json(403, { message: "Player already exists" });
    } else {
      const collection = $app.findCollectionByNameOrId("lobby_players");
      console.log("Collection found:", collection.name);

      const record = new Record(collection);

      record.set("lobby", lobbyId);
      record.set("player_id", userId);
      record.set("player", username);
      record.set("ip_address", ip);
      record.set("connected", true);
      record.set("alive", true);

      try {
        $app.save(record);
        console.log("New player record saved successfully, ID:", record.id);
      } catch (error) {
        console.error("ERROR: Failed to save new player record:", error.message, error);
        return e.json(500, { message: "Failed to create player record" });
      }

      const response = {
        record: {
          id: record.id,
          player: username,
          connected: true,
          guest: !e.authRecord,
        },
      };
      return e.json(201, response);
    }
  } catch (error) {
    console.error("=== UNHANDLED ERROR IN JOIN LOBBY ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error object:", JSON.stringify(error, null, 2));
    return e.json(500, {
      message: "Something went wrong while processing your request.",
      error: error.message,
    });
  }
});
