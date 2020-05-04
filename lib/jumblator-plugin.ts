import { encryptField, decryptField, generateSearchHash } from './jumblator-encryption';
import { log } from './log';
import { Options } from './types';

// @todo: Fix this
type Schema = any;

interface SchemaType {
  options: {
    encrypt: boolean;
    searchable: boolean;
  }
};

export const lastModifiedPlugin = function (schema: Schema, options: Options) {
  const keySize = options.keySize ?? 256;
  const keySalt = options.keySalt ?? 'keySalt';
  const seed = options.seed ?? 'seed';
  const encoding = options.encoding ?? 'Hex';
  const length = options.length ?? 512;
  const secret = options.secret;
  const providedOptions: Options = {
    keySize,
    keySalt,
    seed,
    encoding,
    length,
    secret
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
    const newPath = '__' + path + '_enc';
    schema.add({ [newPath]: String });
  });

  pathsToHash.forEach((path) => {
    const newPath = '__' + path + '_hash';
    schema.add({ [newPath]: String });
  });

  async function updateHandler() {
    const conditions = this._conditions;
    const updates = this._update;

    for (let i = 0; i < pathsToHash.length; i++) {
      if (Object.keys(conditions).includes(pathsToHash[i])) {
        const newPath = '__' + pathsToHash[i] + '_hash';
        const hash = generateSearchHash(conditions[pathsToHash[i]]);
        this.where({ [newPath]: hash });
        delete conditions[pathsToHash[i]];
      }
    }

    for (let j = 0; j < pathsToEncrypt.length; j++) {
      if (Object.keys(updates).includes(pathsToEncrypt[j])) {
        const newPath = '__' + pathsToEncrypt[j] + '_enc';
        const enc = await encryptField(
          updates[pathsToEncrypt[j]],
          options.secret,
          providedOptions
        );
        const newPathHash = '__' + pathsToEncrypt[j] + '_hash';
        const hash = generateSearchHash(updates[pathsToEncrypt[j]]);
        this.update({}, { [newPath]: enc, [newPathHash]: hash });
        delete updates[pathsToEncrypt[j]];
        log.debug('updates', updates);
        log.debug('conditions', conditions);
      }
    }
  }

  schema.pre('save', async function (next: any) {
    for (let j = 0; j < pathsToHash.length; j++) {
      const hash = generateSearchHash(this[pathsToHash[j]]);
      const hashPath = '__' + pathsToHash[j] + '_hash';
      this[hashPath] = hash;
    }
    for (let i = 0; i < pathsToEncrypt.length; i++) {
      const enc = await encryptField(
        this[pathsToEncrypt[i]],
        options.secret,
        providedOptions
      );
      const encPath = '__' + pathsToEncrypt[i] + '_enc';
      this[encPath] = enc;
      this[pathsToEncrypt[i]] = undefined;
    }

    next();
  });

  schema.pre('findOne', async function () {
    const conditions = this.find()._conditions;
    for (let i = 0; i < pathsToHash.length; i++) {
      if (Object.keys(conditions).includes(pathsToHash[i])) {
        const newPath = '__' + pathsToHash[i] + '_hash';
        log.debug(conditions[pathsToHash[i]]);
        const hash = generateSearchHash(conditions[pathsToHash[i]]);
        log.debug(hash);
        delete conditions[pathsToHash[i]];
        this.where({ [newPath]: hash });
        log.debug(conditions);
      }
    }
  });

  schema.pre('find', async function () {
    const conditions = this.find()._conditions;
    for (let i = 0; i < pathsToHash.length; i++) {
      if (Object.keys(conditions).includes(pathsToHash[i])) {
        const newPath = '__' + pathsToHash[i] + '_hash';
        log.debug(conditions[pathsToHash[i]]);
        const hash = generateSearchHash(conditions[pathsToHash[i]]);
        log.debug(hash);
        delete conditions[pathsToHash[i]];
        this.where({ [newPath]: hash });
        log.debug(conditions);
      }
    }
  });

  schema.post('findOne', async function (next: any) {
    let keys = [];
    for (let key in next) {
      if (/^__[A-Za-z]+_enc/.test(key)) {
        keys.push(key);
      }
    }

    log.debug('keys', keys);
    for (let i = 0; i < keys.length; i++) {
      const originalKey = keys[i].split('_')[2];
      const dec = await decryptField(
        next[keys[i]],
        options.secret,
        providedOptions
      );
      next[originalKey] = dec;
      next[keys[i]] = undefined;
      const hashKey = '__' + originalKey + '_hash';
      delete next[hashKey];
    }
  });

  schema.post('find', async function (next: any) {
    for (let j = 0; j < next.length; j++) {
      let keys = [];
      for (let key in next[j]) {
        if (/^__[A-Za-z]+_enc/.test(key)) {
          keys.push(key);
        }
      }

      for (let i = 0; i < keys.length; i++) {
        const originalKey = keys[i].split('_')[2];
        const dec = await decryptField(
          next[j][keys[i]],
          options.secret,
          providedOptions
        );
        next[j][originalKey] = dec;
        next[j][keys[i]] = undefined;
        const hashKey = '__' + originalKey + '_hash';
        next[j][hashKey] = undefined;
      }
    }
  });

  schema.pre('findOneAndUpdate', updateHandler);
  schema.pre('updateOne', updateHandler);
  schema.pre('update', updateHandler);
  schema.pre('updateMany', updateHandler);
};

export default lastModifiedPlugin;