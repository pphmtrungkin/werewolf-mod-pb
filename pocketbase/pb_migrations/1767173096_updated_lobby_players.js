/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2655066279")

  // update collection data
  unmarshal({
    "name": "game_players"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2655066279")

  // update collection data
  unmarshal({
    "name": "lobby_players"
  }, collection)

  return app.save(collection)
})
