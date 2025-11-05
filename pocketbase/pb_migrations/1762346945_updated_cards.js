/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3481593366")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select88666607",
    "maxSelect": 3,
    "name": "actions",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "kill",
      "protect",
      "view",
      "curse"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3481593366")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select88666607",
    "maxSelect": 3,
    "name": "actions",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "kill",
      "protect",
      "view"
    ]
  }))

  return app.save(collection)
})
