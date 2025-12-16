/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2655066279")

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2655066279")

  // remove field
  collection.fields.removeById("text2582050271")

  return app.save(collection)
})
