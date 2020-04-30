const CryptoJS = require("crypto-js");
const assert = require("assert");
/*
const plain = "Are you a man of your word?";
const passPhrase = "KillTheJew!";

const encrypted = CryptoJS.AES.encrypt(plain, passPhrase);
const decrypted = CryptoJS.AES.decrypt(encrypted, passPhrase);

/*
assert(
  decrypted.toString(CryptoJS.enc.Utf8) === plain,
  "Plaintext was not equal to decrypted."
);
*/

/*
console.log(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(plain)));


const salt = CryptoJS.lib.WordArray.random(128 / 8);
const key = CryptoJS.PBKDF2(plain, salt, {
  keySize: 512 / 32,
  iterations: 1000,
}).toString(CryptoJS.enc.Hex);

const iv = CryptoJS.enc.Base64.parse(
  CryptoJS.SHA3(plain).toString(CryptoJS.enc.Hex)
);

const plainT = "Are you a fool?";

var JsonFormatter = {
  stringify: (cipherParams) => {
    // create json object with ciphertext
    var jsonObj = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) }
​
    // optionally add iv or salt
    if (cipherParams.iv) {
      jsonObj.iv = cipherParams.iv.toString()
    }
​
    if (cipherParams.salt) {
      jsonObj.s = cipherParams.salt.toString()
    }
​
    // stringify json object
    return JSON.stringify(jsonObj)
  },
  parse: (jsonStr) => {
    // parse json string
    var jsonObj = JSON.parse(jsonStr)
​
    // extract ciphertext from json object, and create cipher params object
    var cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
    });
​
    // optionally extract iv or salt
​
    if (jsonObj.iv) {
      cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
    }
​
    if (jsonObj.s) {
      cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
    }
​
    return cipherParams
  }
};
​

const encryptedBlocks = CryptoJS.AES.encrypt(plainT, key, { iv: iv, format: JsonFormatter });
const decryptedPlain = CryptoJS.AES.decrypt(encryptedBlocks,key, {format: JsonFormatter});

assert(
  decryptedPlain.toString(CryptoJS.enc.Utf8) === plainT,
  "not the same jane!"
);

console.log(encryptedBlocks);
*/

var JsonFormatter = {
  stringify: function (cipherParams) {
    // create json object with ciphertext
    var jsonObj = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };

    // optionally add iv or salt
    if (cipherParams.iv) {
      jsonObj.iv = cipherParams.iv.toString();
    }

    if (cipherParams.salt) {
      jsonObj.s = cipherParams.salt.toString();
    }

    // stringify json object
    return JSON.stringify(jsonObj);
  },
  parse: function (jsonStr) {
    // parse json string
    var jsonObj = JSON.parse(jsonStr);

    // extract ciphertext from json object, and create cipher params object
    var cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct),
    });

    // optionally extract iv or salt

    if (jsonObj.iv) {
      cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
    }

    if (jsonObj.s) {
      cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
    }

    return cipherParams;
  },
};
const plain = "Are you a man of your word?";
const plainT = "Are you a fool?";

const salt = CryptoJS.lib.WordArray.random(128 / 8);
const key = CryptoJS.PBKDF2(plain, salt, {
  keySize: 512 / 32,
  iterations: 1000,
}).toString(CryptoJS.enc.Hex);

const iv = CryptoJS.SHA3("Message", { outputLength: 512 }).toString(
  CryptoJS.enc.Base64
);

const encrypted = CryptoJS.AES.encrypt(plainT, key, {
  iv: iv,
  format: JsonFormatter,
});
const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key, {
  format: JsonFormatter,
});

console.log(
  CryptoJS.SHA3("Message", { outputLength: 512 }).toString(CryptoJS.enc.Base64)
);

let defaultOptions = { 1: 2, 3: 3 };
let providedOptions = { 1: 5 };

const options = { ...defaultOptions, ...providedOptions };

console.log(options);
