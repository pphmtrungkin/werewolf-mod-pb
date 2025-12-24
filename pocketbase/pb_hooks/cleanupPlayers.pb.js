cron.add("cleanup-players", "*/1 * * * *", async () => {
  const cutoff = new Date(Date.now() - 60_000).toISOString();
});
