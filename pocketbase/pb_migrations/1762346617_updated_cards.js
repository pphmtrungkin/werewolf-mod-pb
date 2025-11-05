/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3481593366")

  // remove field
  collection.fields.removeById("relation88666607")

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3481593366")

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2484833797",
    "hidden": false,
    "id": "relation88666607",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "actions",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("select88666607")

  return app.save(collection)
})
