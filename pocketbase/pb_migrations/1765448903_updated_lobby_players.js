/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2655066279")

  // update field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2582050271",
    "max": 15,
    "min": 15,
    "name": "player_id",
    "pattern": "^[a-z0-9]+$",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2655066279")

  // update field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "[a-z0-9]{15}",
    "hidden": false,
    "id": "text2582050271",
    "max": 15,
    "min": 15,
    "name": "player_id",
    "pattern": "^[a-z0-9]+$",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
