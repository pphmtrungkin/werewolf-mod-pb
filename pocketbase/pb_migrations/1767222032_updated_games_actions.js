/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1471521650")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select4198493223",
    "maxSelect": 1,
    "name": "action_type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "kill",
      "protect",
      "view",
      "curse",
      "vote"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1471521650")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select4198493223",
    "maxSelect": 1,
    "name": "action_type",
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
})
