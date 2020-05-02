const encryptField = require("./jumblator-encryption").encrypt;
const decryptField = require("./jumblator-encryption").decrypt;
const genSearchHash = require("./jumblator-encryption").hash;

module.exports = exports = function lastModifiedPlugin(schema, options) {
  pathsToEncrypt = [];
  pathsToHash = [];
  schema.eachPath(function (pathName, schemaType) {
    if (schemaType.options && schemaType.options.encrypt) {
      pathsToEncrypt.push(pathName);
    }
  });

  schema.eachPath(function (pathName, schemaType) {
    if (schemaType.options && schemaType.options.searchable) {
      pathsToHash.push(pathName);
    }
  });

  pathsToEncrypt.forEach((path) => {
    const newPath = "__" + path + "_enc";
    schema.add({ [newPath]: String });
  });

  pathsToHash.forEach((path) => {
    const newPath = "__" + path + "_hash";
    schema.add({ [newPath]: String });
  });

  schema.pre("save", async function (next) {
    for (j = 0; j < pathsToHash.length; j++) {
      const hash = await genSearchHash(this[pathsToHash[i]]);
      const hashPath = "__" + pathsToHash[i] + "_hash";
      this[hashPath] = hash;
    }
    for (i = 0; i < pathsToEncrypt.length; i++) {
      const enc = await encryptField(this[pathsToEncrypt[i]], options.secret);
      const encPath = "__" + pathsToEncrypt[i] + "_enc";
      this[encPath] = enc;
      this[pathsToEncrypt[i]] = undefined;
    }

    next();
  });

  schema.pre("findOne", async function () {
    const conditions = this.find()._conditions;
    for (i = 0; i < pathsToHash.length; i++) {
      if (Object.keys(conditions).includes(pathsToHash[i])) {
        const newPath = "__" + pathsToHash[i] + "_hash";
        console.log(conditions[pathsToHash[i]]);
        const hash = await genSearchHash(conditions[pathsToHash[i]]);
        console.log(hash);
        this.where({ [newPath]: hash });
      }
    }
  });

  schema.post("findOne", async function (next) {
    let keys = [];
    for (let key in next) {
      if (/^__[A-Za-z]+_enc/.test(key)) {
        keys.push(key);
      }
    }

    console.log("keys", keys);
    for (i = 0; i < keys.length; i++) {
      const originalKey = keys[i].split("_")[2];
      const dec = await decryptField(next[keys[i]], options.secret);
      next[originalKey] = dec;
      next[keys[i]] = undefined;
    }
  });

  schema.post("find", async function (next) {
    for (j = 0; j < next.length; j++) {
      let keys = [];
      for (let key in next[j]) {
        if (/^__[A-Za-z]+_enc/.test(key)) {
          keys.push(key);
        }
      }

      for (i = 0; i < keys.length; i++) {
        const originalKey = keys[i].split("_")[2];
        const dec = await decryptField(next[j][keys[i]], options.secret);
        next[j][originalKey] = dec;
        next[j][keys[i]] = undefined;
      }
    }
  });
};
