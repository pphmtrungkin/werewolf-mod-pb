/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "[a-z0-9]{6}",
    "hidden": false,
    "id": "text1997877400",
    "max": 0,
    "min": 0,
    "name": "code",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1299647666",
    "max": 0,
    "min": 0,
    "name": "ip_prefix",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1781576296",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "moderator",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
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

  // add field
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

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1574334436")

  // remove field
  collection.fields.removeById("text1997877400")

  // remove field
  collection.fields.removeById("text1299647666")

  // remove field
  collection.fields.removeById("relation1781576296")

  // remove field
  collection.fields.removeById("number3965507238")

  // remove field
  collection.fields.removeById("number3049552019")

  // remove field
  collection.fields.removeById("date989355118")

  return app.save(collection)
})
