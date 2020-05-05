const plugin = require("../lib/jumblator-plugin.ts");
const mongoose = require("mongoose");

const SCHEMA = mongoose.Schema({
  fieldOne: {
    type: String,
    encrypt: true,
    searchable: true,
  },
  fieldTwo: {
    type: String,
    encrypt: true,
  },
  fieldThree: String,
});

SCHEMA.plugin(plugin, { secret: "HHHH" });

const model = mongoose.model("CRYPTO");

const toSave = new model({
  fieldOne: "Hell",
  fieldTwo: "Nell",
  fieldThree: "Bell",
});

toSave.save();