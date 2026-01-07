routerAdd("POST", "/api/createGame", (e) => {
  try {
    const requestInfo = e.requestInfo();
    const body = requestInfo.body ?? {};

    // Checking if body is an object
    if (typeof body !== "object") {
      console.error("ERROR: Invalid request body type");
      return e.json(400, { message: "Invalid request body" });
    }

    const { name, code, deck } = body;

    console.log("name:", name);
    console.log("code:", code);
    console.log("deck:", deck);

    if (!name || !code || !deck) {
      throw new Error("Missing required fields");
    }

    const ipAddress = e.remoteIP();

    let authRecord = requestInfo.auth;

    let collection = $app.findCollectionByNameOrId("games");

    let record = new Record(collection);

    record.set("name", name);
    record.set("code", code);
    record.set("status", "waiting");
    record.set("moderator", authRecord.id);
    record.set("deck", deck);
    record.set("ip_address", ipAddress);

    try {
      $app.save(record);
    } catch (error) {
      console.error("ERROR: Failed to save game record", error);
      return e.json(500, { message: "Failed to create game" });
    }

    return e.json(201, record);
  } catch (error) {
    console.error("ERROR: Failed to create game", error);
    return e.json(500, { message: "Failed to create game" });
  }
});
