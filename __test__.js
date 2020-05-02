/*const EncryptField = require("./lib/jumblator-encryption").encrypt;
const DecryptField = require("./lib/jumblator-encryption").decrypt;

const plain = "WAR AND PEACE";
const passPhrase = "Hellmybby";

EncryptField(plain, passPhrase)
  .then((enc) => {
    console.log("enc", enc);
    DecryptField(enc, passPhrase)
      .then((dec) => console.log("dec", dec))
      .catch((e) => console.error(e));
  })
  .catch((e) => console.error(e));
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jumblator = require("./lib/jumblator-plugin");

mongoose.connect("mongodb://localhost:27017/jumblator-test", {
  useNewUrlParser: true,
});

const SCHM = new Schema({
  hell: {
    type: String,
    encrypt: true,
  },
});

SCHM.plugin(jumblator, { secret: "HDFDSF", index: true });

const SCHMMODEL = mongoose.model("SSS", SCHM);
/*
const schmm = new SCHMMODEL({
  hell: "HLLL",
});

schmm.save();
*/

SCHMMODEL.findOne({ _id: "5eada0e20b7c2c337c8347ea" }).then((doc) =>
  console.log(doc)
);
