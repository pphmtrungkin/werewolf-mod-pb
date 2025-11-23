/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number3965507238",
    "max": null,
    "min": 0,
    "name": "current_day",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number3049552019",
    "max": null,
    "min": 0,
    "name": "current_night",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number3965507238",
    "max": null,
    "min": null,
    "name": "current_day",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number3049552019",
    "max": null,
    "min": null,
    "name": "current_night",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
