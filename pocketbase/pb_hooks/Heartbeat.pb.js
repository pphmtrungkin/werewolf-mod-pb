routerAdd("POST", "/api/heartbeat", (e) => {
  let body = e.requestInfo().body;
  let { playerName, lobbyId } = body;

  try {
    let player = $app.findFirstRecordByFilter(
      "lobby_players",
      "name = {:playerName} && lobby = {:lobbyId}",
      { playerName: playerName, lobbyId: lobbyId },
    );
    if (!player) throw new Error("Player not found");

    player.set("updated", new Date().toISOString());
    player.save(record);
    return { status: 200, body: "Heartbeat received" };
  } catch (error) {
    console.error(error);
    return { status: 500, body: "Internal Server Error" };
  }
});
