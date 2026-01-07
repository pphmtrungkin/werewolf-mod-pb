/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1618490516")

  // remove field
  collection.fields.removeById("text1997877400")

  // remove field
  collection.fields.removeById("text1299647666")

  // remove field
  collection.fields.removeById("select2063623452")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2982008523",
    "maxSelect": 1,
    "name": "phase",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "waiting",
      "night",
      "day",
      "voting",
      "completed"
    ]
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "date3069596776",
    "max": "",
    "min": "",
    "name": "phase_timer",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(8, new Field({
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1618490516")

  // add field
  collection.fields.addAt(1, new Field({
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
  collection.fields.addAt(2, new Field({
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
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "waiting",
      "completed",
      "in_progress"
    ]
  }))

  // remove field
  collection.fields.removeById("select2982008523")

  // remove field
  collection.fields.removeById("date3069596776")

  // remove field
  collection.fields.removeById("relation1022291629")

  return app.save(collection)
})
