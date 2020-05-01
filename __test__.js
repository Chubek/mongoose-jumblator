const EncryptField = require("./lib/jumblator-encryption").encrypt;
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
