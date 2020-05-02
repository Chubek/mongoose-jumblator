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
  dell: {
    type: String,
    encrypt: true,
  },
  poor: String,
});

SCHM.plugin(jumblator, { secret: "HDFDSF" });

const SCHMMODEL = mongoose.model("SSS", SCHM);

const schmm = new SCHMMODEL({
  hell: "HLLL",
  dell: "hash",
  poor: "boor",
});

schmm.save();

/*
SCHMMODEL.findOne({
  hell: "HLLL",
}).then((doc) => console.log(doc));
*/
