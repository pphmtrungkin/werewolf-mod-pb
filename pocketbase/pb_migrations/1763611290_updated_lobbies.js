/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // remove field
  collection.fields.removeById("date989355118")

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "autodate989355118",
    "name": "completed",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "date989355118",
    "max": "",
    "min": "",
    "name": "completed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // remove field
  collection.fields.removeById("autodate989355118")

  return app.save(collection)
})
