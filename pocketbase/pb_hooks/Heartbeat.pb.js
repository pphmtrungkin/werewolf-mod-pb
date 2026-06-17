routerAdd("POST", "/api/heartbeat", (e) => {
  let body = e.requestInfo().body;
  let { playerName, lobbyId } = body;

  try {
    let player = $app.findFirstRecordByFilter(
      "game_players",
      "player = {:playerName} && game = {:lobbyId}",
      { playerName: playerName, lobbyId: lobbyId },
    );
    if (!player) throw new Error("Player not found");

    player.set("updated", new Date().toISOString());
    $app.save(player);
    return { status: 200, body: "Heartbeat received" };
  } catch (error) {
    console.error(error);
    return { status: 500, body: "Internal Server Error" };
  }
});
