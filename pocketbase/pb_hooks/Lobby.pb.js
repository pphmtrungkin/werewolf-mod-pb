routerAdd("POST", "/api/removePlayer", (e) => {
  console.log(toString(e.request.body));
  let body = e.requestInfo().body;

  const playerName = body.playerName;

  let record = $app.findFirstRecordByFilter(
    "lobby_players",
    "player = {playerName}",
    { playerName: playerName },
  );

  console.log(playerName, record);

  return e.json(200, { success: true });
});
