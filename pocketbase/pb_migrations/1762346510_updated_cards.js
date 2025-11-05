/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3481593366")

  // remove field
  collection.fields.removeById("number214275153")

  // remove field
  collection.fields.removeById("json88666607")

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

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3481593366")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number214275153",
    "max": null,
    "min": null,
    "name": "number_of_targets",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "json88666607",
    "maxSize": 0,
    "name": "actions",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // remove field
  collection.fields.removeById("relation88666607")

  return app.save(collection)
})
