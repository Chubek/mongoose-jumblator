const encryptField = require("./jumblator-encryption").encrypt;
const decryptField = require("./jumblator-encryption").decrypt;

module.exports = exports = function lastModifiedPlugin(schema, options) {
  schema.add({ __hell_enc: String });

  schema.pre("save", async function (next) {
    const enc = await encryptField(this.hell, options.secret);
    this.__hell_enc = enc;
    this.hell = undefined;
    next();
  });

  if (options && options.index) {
    schema.path("__hell_enc").index(options.index);
  }

  schema.post("findOne", async function (next, data) {
    let keys = [];
    for (let key in next) {
      if (/^__[A-Za-z]+_enc/.test(key)) {
        keys.push(key);
      }
    }

    console.log("keys", keys);
    for (i = 0; i < keys.length; i++) {
      const originalKey = keys[i].split("_")[2];
      console.log("originalKey", originalKey);
      const dec = await decryptField(next[keys[i]], options.secret);
      next[originalKey] = dec;
      next[keys[i]] = undefined;
    }
  });
};
