function formatPbDateTime(date) {
  const pad = (n, width = 2) => n.toString().padStart(width, "0");

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hour = pad(date.getUTCHours());
  const minute = pad(date.getUTCMinutes());
  const second = pad(date.getUTCSeconds());
  const msec = pad(date.getUTCMilliseconds(), 3);

  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${msec}Z`;
}

cronAdd("cleanup-players", "*/1 * * * *", async () => {
  const cutoffDate = new Date(Date.now() - 1 * 60_000); // 1 minute ago
  const cutoff = formatPbDateTime(cutoffDate);

  let stalePlayers = null;

  try {
    stalePlayers = $app.findRecordsByFilter("lobby_players", `updated < "${cutoff}"`, 100, 0);
  } catch (error) {
    console.error("Error fetching stale players:", error);
  }

  if (!stalePlayers || stalePlayers.length === 0) {
    return;
  }

  stalePlayers.forEach((player) => {
    try {
      $app.delete(player);
    } catch (err) {
      console.error("Error deleting stale player:", player.id, err);
    }
  });
});
