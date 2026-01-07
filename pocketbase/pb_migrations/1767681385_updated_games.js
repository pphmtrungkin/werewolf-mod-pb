/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1618490516")

  // remove field
  collection.fields.removeById("relation1022291629")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1618490516")

  // add field
  collection.fields.addAt(10, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2655066279",
    "hidden": false,
    "id": "relation1022291629",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "current_player_turn",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
