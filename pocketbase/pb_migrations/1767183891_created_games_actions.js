/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_1574334436",
        "hidden": false,
        "id": "relation590033292",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "game",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2655066279",
        "hidden": false,
        "id": "relation1148540665",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "actor",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
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
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2655066279",
        "hidden": false,
        "id": "relation1181691900",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "target",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "number2675594674",
        "max": null,
        "min": null,
        "name": "night_number",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_1471521650",
    "indexes": [],
    "listRule": null,
    "name": "games_actions",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1471521650");

  return app.delete(collection);
})
