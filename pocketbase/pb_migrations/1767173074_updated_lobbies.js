/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // update collection data
  unmarshal({
    "name": "games"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // update collection data
  unmarshal({
    "name": "lobbies"
  }, collection)

  return app.save(collection)
})
