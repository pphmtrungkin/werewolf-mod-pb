/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2655066279")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool448207029",
    "name": "connected",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "bool272325203",
    "name": "alive",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2655066279")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool448207029",
    "name": "connected",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "bool"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "bool272325203",
    "name": "alive",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
})
