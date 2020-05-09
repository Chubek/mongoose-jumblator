# Mongoose Jumblator

A node.js module for encrypting Mongoose fields using AES.

## Collaborators

- Chubak Bidpaa: Crypto, Plugin
- Alexis Tyler: Convert to Typescript
- Sethuraman S: Spark and Remittance

---

## Version 1.2.0 Changes

- You can now go two levels deep. It may not work for more than that so keep this in mind.
- Now you can view the decrypted info after saving.

## How to install and use

1. Create a new project.
2. `npm init`
3. `npm i -S mongoose-jumblator`
4. Create a schema:

```javascript
const mongoose = require("mongoose");
const jumblator = require("mongoose-jumblator").fieldEncryptionPlugin;

const mySchema = new mongoose.Schema({
  fieldOne: {
    type: String,
    encrypt: true,
    searchable: true, //searchable field
  },
  fieldTwo: {
    type: String,
    encrypt: true, //non-searchable field
  },
  fieldThree: String,
});

mySchema.plugin(jumblator, { secret: "aCompleXW0Rd" /* other options */ });

const mySchemaModel = mongoose.model("EncryptedDocument", mySchema);
```

From then on, everything works the same. You don't need to change your quries, or updates, or anything. The field is encrypted in your docuemnt, but when you `find[One]`, `findOneAndUpdate` or anything else, it works as if nothing has changed.

But if a field that is indicated as `encrypt: true` is not indicated as `searchable: true`, it won't be searched. So keep that in mind, if you want yout field to be searchable, set it to `searchable: true`.

---

## Options

- secret --- a good secret passphrase for generating a key of the detrmind size. Needs to be complex!
- keySize --- Size of your key, defaults to 256
- keySalt --- salt for key generation, defaults to some lame value
- seed --- seed for creating the initial value hash, defaults to some extremely lame value.
- encoding --- encoding for the ciphertext, defaults to Hex. Can be Base64, Utf8, Utf16, or Hex.
- length --- length of the initial value, defautls to 512

Mocha and Chai are ready to be served by me, your faithful barista. Or you can forgo testing frameworks and do it old style. You're the tester!

If you had any problems, contact me on `Discord@Chubak#7400` or `chubakbidpaa@gmail.com` or `Reddit@TheAvogadroConstant`. Better yet, pull a request and fix it yourself. Or open up an issue. Or fork it! Anything's welcome.
