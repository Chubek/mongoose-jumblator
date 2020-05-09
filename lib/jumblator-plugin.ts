import {
  encryptField,
  decryptField,
  generateSearchHash,
} from "./jumblator-encryption";
import { log } from "./log";
import { Options } from "./types";
import _ from "lodash";

// @todo: Fix this
type Schema = any;

interface SchemaType {
  options: {
    encrypt: boolean;
    searchable: boolean;
  };
}

export const fieldEncryptionPlugin = function (
  schema: Schema,
  options: Options
) {
  const keySize = options.keySize ?? 256;
  const keySalt = options.keySalt ?? "keySalt";
  const seed = options.seed ?? "seed";
  const encoding = options.encoding ?? "Hex";
  const length = options.length ?? 512;
  const secret = options.secret;
  const providedOptions: Options = {
    keySize,
    keySalt,
    seed,
    encoding,
    length,
    secret,
  };

  const pathsToEncrypt: string[] = [];
  const pathsToHash: string[] = [];
  schema.eachPath((pathName: string, schemaType: SchemaType) => {
    if (schemaType.options && schemaType.options.encrypt) {
      pathsToEncrypt.push(pathName);
    }
  });

  schema.eachPath((pathName: string, schemaType: SchemaType) => {
    if (schemaType.options && schemaType.options.searchable) {
      pathsToHash.push(pathName);
    }
  });

  pathsToEncrypt.forEach((path) => {
    const pathSplit = path.split(".");
    if (pathSplit.length > 1) {
      const newPath = pathSplit[0] + ".__" + pathSplit[1] + "_enc";
      schema.add({ [newPath]: String });
    }
    const newPath = "__" + path + "_enc";
    schema.add({ [newPath]: String });
  });

  pathsToHash.forEach((path) => {
    const pathSplit = path.split(".");
    if (pathSplit.length > 1) {
      const newPath = pathSplit[0] + ".__" + pathSplit[1] + "_hash";
      schema.add({ [newPath]: String });
    }
    const newPath = "__" + path + "_hash";
    schema.add({ [newPath]: String });
  });

  async function decryptHandler(next: any) {
    let keys = [];
    for (let key in next) {
      if (/^__[A-Za-z]+_enc/.test(key)) {
        keys.push(key);
      }
    }

    pathsToEncrypt.forEach((path) => {
      const keySplit = path.split(".");
      if (keySplit.length > 1) {
        for (let nextKey in next) {
          if (nextKey === keySplit[0]) {
            keys.push(nextKey + ".__" + keySplit[1] + "_enc");
          }
        }
      }
    });

    for (let i = 0; i < keys.length; i++) {
      const originalKey = keys[i].split("_")[2];
      const originalKeySplitPeriod = keys[i].split(".");

      const dec = await decryptField(
        _.get(next, keys[i]),
        options.secret,
        providedOptions
      );

      _.set(next, originalKey, dec);
      let hashKey = "__" + originalKey + "_hash";
      if (originalKeySplitPeriod.length > 1) {
        hashKey =
          originalKeySplitPeriod[0] +
          ".__" +
          originalKeySplitPeriod[1].split("_")[2] +
          "_hash";
      }
      _.set(next, hashKey, (undefined as unknown) as String);
      _.set(next, keys[i], (undefined as unknown) as String);
    }
  }

  async function updateHandler() {
    const conditions = this._conditions;
    const updates = this._update;

    for (let i = 0; i < pathsToHash.length; i++) {
      if (Object.keys(conditions).includes(pathsToHash[i])) {
        const pathSplit = pathsToHash[i].split(".");
        let newPath = "__" + pathsToHash[i] + "_hash";
        if (pathSplit.length > 1) {
          newPath = pathSplit[0] + ".__" + pathSplit[1] + "_hash";
        }
        const hash = generateSearchHash(conditions[pathsToHash[i]]);
        this.where({ [newPath]: hash });
        delete conditions[pathsToHash[i]];
      }
    }

    for (let j = 0; j < pathsToEncrypt.length; j++) {
      if (Object.keys(updates).includes(pathsToEncrypt[j])) {
        const pathSplit = pathsToEncrypt[j].split(".");
        let newPath = "__" + pathsToEncrypt[j] + "_enc";
        if (pathSplit.length > 1) {
          newPath = pathSplit[0] + ".__" + pathSplit[1] + "_hash";
        }
        const enc = await encryptField(
          updates[pathsToEncrypt[j]],
          options.secret,
          providedOptions
        );
        const newPathHash = "__" + pathsToEncrypt[j] + "_hash";
        const hash = generateSearchHash(updates[pathsToEncrypt[j]]);
        this.update({}, { [newPath]: enc, [newPathHash]: hash });
        delete updates[pathsToEncrypt[j]];
      }
    }
  }

  schema.pre("save", async function (next: any) {
    for (let j = 0; j < pathsToHash.length; j++) {
      const pathSplit = pathsToHash[j].split(".");
      const hash = generateSearchHash(this[pathsToHash[j]]);
      let hashPath = "__" + pathsToHash[j] + "_hash";
      if (pathSplit.length > 1) {
        hashPath = pathSplit[0] + ".__" + pathSplit[1] + "_hash";
        _.set(this, hashPath, hash.toString());
      } else {
        this[hashPath] = hash.toString();
      }
    }
    for (let i = 0; i < pathsToEncrypt.length; i++) {
      const enc = await encryptField(
        _.get(this, pathsToEncrypt[i]),
        options.secret,
        providedOptions
      );
      const pathSplit = pathsToEncrypt[i].split(".");
      let encPath = "__" + pathsToEncrypt[i] + "_enc";
      if (pathSplit.length > 1) {
        encPath = pathSplit[0] + ".__" + pathSplit[1] + "_enc";
        _.set(this, encPath, enc);
        _.unset(this, pathsToEncrypt[i]);
      } else {
        this[encPath] = enc;
        this[pathsToEncrypt[i]] = undefined;
      }
    }

    next();
  });
  schema.post("save", decryptHandler);
  schema.post("findOne", decryptHandler);
  schema.post("findOneAndUpdate", decryptHandler);

  schema.pre("findOne", async function () {
    const conditions = this.find()._conditions;
    for (let i = 0; i < pathsToHash.length; i++) {
      if (Object.keys(conditions).includes(pathsToHash[i])) {
        const pathSplit = pathsToHash[i].split(".");
        const hash = generateSearchHash(conditions[pathsToHash[i]]);
        let newPath = "__" + pathsToHash[i] + "_hash";
        if (pathSplit.length > 1) {
          newPath = pathSplit[0] + ".__" + pathSplit[1] + "_hash";
        }
        delete conditions[pathsToHash[i]];
        this.where({ [newPath]: hash });
      }
    }
  });

  schema.pre("find", async function () {
    const conditions = this.find()._conditions;
    for (let i = 0; i < pathsToHash.length; i++) {
      if (Object.keys(conditions).includes(pathsToHash[i])) {
        const pathSplit = pathsToHash[i].split(".");
        const hash = generateSearchHash(conditions[pathsToHash[i]]);
        let newPath = "__" + pathsToHash[i] + "_hash";
        if (pathSplit.length > 1) {
          newPath = pathSplit[0] + ".__" + pathSplit[1] + "_hash";
        }
        delete conditions[pathsToHash[i]];
        this.where({ [newPath]: hash });
      }
    }
  });

  schema.post("find", async function (next: any) {
    for (let j = 0; j < next.length; j++) {
      let keys = [];
      for (let key in next[j]) {
        if (/^__[A-Za-z]+_enc/.test(key)) {
          keys.push(key);
        }
      }

      pathsToEncrypt.forEach((path) => {
        const keySplit = path.split(".");
        if (keySplit.length > 1) {
          for (let nextKey in next[j]) {
            if (nextKey === keySplit[0]) {
              keys.push(nextKey + ".__" + keySplit[1] + "_enc");
            }
          }
        }
      });

      for (let i = 0; i < keys.length; i++) {
        const originalKey = keys[i].split("_")[2];
        const originalKeySplitPeriod = keys[i].split(".");

        const dec = await decryptField(
          _.get(next[j], keys[i]),
          options.secret,
          providedOptions
        );
        _.set(next[j], originalKey, dec);
        let hashKey = "__" + originalKey + "_hash";
        if (originalKeySplitPeriod.length > 1) {
          hashKey =
            originalKeySplitPeriod[0] +
            ".__" +
            originalKeySplitPeriod[1].split("_")[2] +
            "_hash";
        }
        _.set(next[j], hashKey, (undefined as unknown) as String);
        _.set(next[j], keys[i], (undefined as unknown) as String);
      }
    }
  });

  schema.pre("findOneAndUpdate", updateHandler);
  schema.pre("updateOne", updateHandler);
  schema.pre("update", updateHandler);
  schema.pre("updateMany", updateHandler);
};
