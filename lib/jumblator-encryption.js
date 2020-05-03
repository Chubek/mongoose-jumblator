/**
 * @file This file contains the cryptographic logic for the mongoose-jumblator module.
 * @author Chubak Bidpaa <Chubakbidpaa@gmail.com>
 * @copyright Chubak Bidpaa 2020
 * @module mongoose-jumblator
 * @license MIT
 */

const CryptoJS = require("crypto-js");
const Formatter = require("./json-formatter");
const consts = require("./consts");

// Get the encoding.
const setEncoding = (encoding) => {
  if (!Object.keys(consts.ivEncEnum).includes(encoding)) {
    throw new Error(`Encoding must be Hex, Utf8, Utf16 or Base 64. Yours is ${encoding}`);
  }

  return consts.ivEncEnum[encoding];
};

/**
 * Brief description of the function here.
 * @summary Generates the necessary key for the encryption.
 * @param {string} secretPassPhrase - the pass phrase.
 * @param {number} keySize - The size of the key in bits. Must be 128, 256, or 512.
 * @reject {Error} key size must fit.
 * @fulfill {CryptoJS.WordArray} key.
 * @return {Promise<string>} The returned data is a WordArray object which can only be used in CryptoJS. So don't use it anywhere else!
 */
const generateKey = async (secretPassPhrase, keySize, encoding, salt) => {
  // Check if param is valid.
  if (Object.values(consts.keySizeEnum).indexOf(keySize) <= -1) {
    throw new Error(`Key size must be 128, 256, or 512. But your keySize is ${keySize}`);
  }

  // Generating the key.
  const key = CryptoJS.PBKDF2(secretPassPhrase, salt, {
    keySize: keySize,
  }).toString(setEncoding(encoding));

  return key;
}

/**
 * Brief description of the function here.
 * @summary Generates an initial value for the encryption process.
 * @param {string} seed - An ASCII/UTF8-encoded phrase to start off the hashing process.
 * @param {string} encoding - The encoding of the initial value. Must be Hex, Base64, Utf8 or Utf16.
 * @param {number} length - Length of the initial value hash. Must be a multiple of 8 and less than or equal to 2048.
 * @promise fPromise
 * @reject {Error}
 * @fullfill {string}
 * @return {Promise<string>} A string as specified by your own encoding.
 */
const generateIv = async (seed, encoding, length) => {
  if ((length % 8 != 0) || length > 2048) {
    throw new Error("Length must be a multiple of 8 and less than or equal to 2048.");
  }

  const key = CryptoJS.SHA3(seed, { outputLength: length }).toString(setEncoding(encoding));
  return key;
}

/**
 * Brief description of the function here.
 * @summary encrypt the field given the options. Default options provided.
 * @param {string} plainField - field to encrypt.
 * @param {string} secretPassPhrase - passphrase for generating the key.
 * @param {object} providedOptions - options. Options include passphrase for key, key size, initial value seed, initial value encoding, initial value length.
 * @return A formatter object containing ciphertext, cipheriv, cipher seed.
 */
async function encryptField(
  plainField,
  secretPassPhrase,
  providedOptions = {}
) {
  // We thusly spead out both the objects merge them.
  const options = { ...consts.defaultOptions, ...providedOptions };

  const key = await generateKey(
    secretPassPhrase,
    options.keySize,
    options.encoding,
    options.keySalt
  );
  const iv = await generateIv(options.seed, options.encoding, options.length);

  const encrypted = CryptoJS.AES.encrypt(plainField, key, {
    iv: iv,
    format: Formatter,
  });

  return encrypted.toString();
}

/**
 * Brief description of the function here.
 * @summary Decrypt the field.
 * @param cipherField - the cipher field to decrypt.
 * @param {string} secretPassPhrase - password phrase to generate the key with.
 * @param {object} providedOptions - options. Options include passphrase for key, key size, initial value seed, initial value encoding, initial value length.
 * @return Brief description of the returning value here.
 */
async function decryptField(
  cipherField,
  secretPassPhrase,
  providedOptions = {}
) {
  const options = { ...consts.defaultOptions, ...providedOptions };

  const key = await generateKey(
    secretPassPhrase,
    options.keySize,
    options.encoding,
    options.keySalt
  );

  const decrypted = CryptoJS.AES.decrypt(cipherField, key, {
    format: Formatter,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Brief description of the function here.
 * @summary Generates the search hash.
 * @param {string} field - the search hash.
 * @return {CryptoJS.WordArray} The hash to save.
 */
const generateSearchHash = (field) => CryptoJS.SHA256(field);

exports.encrypt = encryptField;
exports.decrypt = decryptField;
exports.hash = generateSearchHash;
