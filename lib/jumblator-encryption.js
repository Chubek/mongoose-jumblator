/**
 * @file This file contains the cryptographic logic for the mongoose-jumblator module.
 * @author Chubak Bidpaa <Chubakbidpaa@gmail.com>
 * @copyright Chubak Bidpaa 2020
 * @module mongoose-jumblator
 * @license MIT
 */

const CryptoJS = require("crypto-js");
const Formatter = require("./json-formatter");

//Enums
const keySizeEnum = { 128: 128, 256: 256, 512: 512 };
Object.freeze(keySizeEnum);

const ivEncEnum = {
  Base64: "Base64",
  Hex: "Hex",
  Utf8: "Utf8",
  Utf16: "Utf16",
};
Object.freeze(ivEncEnum);

const defaultOptions = {
  keySize: 256,
  seed: "seed", //this must be passed!!
  encoding: "Hex",
  length: 512,
};
Object.freeze(defaultOptions);

/**
 * Brief description of the function here.
 * @summary Generates the necessary key for the encryption.
 * @param {String} secretPassPhrase - the pass phrase.
 * @param {int} keySize - The size of the key in bits. Must be 128, 256, or 512.
 * @return {CryptoJS.lib.WordArray} The returned data is a WordArray object which can only be used in CryptoJS. So don't use it anywhere else!
 */
function generateKey(secretPassPhrase, keySize) {
  return new Promise((resolve, reject) => {
    //Check if param is valid.
    if (Object.values(keySizeEnum).indexOf(keySize) <= -1) {
      reject("Key size must be 128, 256, or 512.");
    }
    //Generate salt. We divide by 8 because the keysize must it must be in bits, not bytes.
    const salt = CryptoJS.lib.WordArray.random(keySize / 8);
    //Generating the key.
    try {
      resolve(
        CryptoJS.PBKDF2(secretPassPhrase, salt, { keySize: keySize / 32 })
      );
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Brief description of the function here.
 * @summary Generates an initial value for the encryption process.
 * @param {String} seed - An ASCII/UTF8-encoded phrase to start off the hashing process.
 * @param {String} encoding - The encoding of the initial value. Must be Hex, Base64, Utf8 or Utf16.
 * @param {int} length - Length of the initial value hash. Must be a multiple of 8 and less than or equal to 2048.
 * @return {String} A string as specified by your own encoding. The reason for the discrepency between this return type and generateKey return type is that I don't like you.
 */
function generateIv(seed, encoding, length) {
  return new Promise((resolve, reject) => {
    if (Object.values(ivEncEnum).indexOf(encoding) <= -1) {
      reject("Encoding must be Base64, Hex, Utf8 or Utf16.");
    }

    const setEncoding = (encoding) => {
      switch (encoding) {
        case "Base64":
          return CryptoJS.enc.Base64;
        case "Hex":
          return CryptoJS.enc.Hex;
        case "Utf8":
          return CryptoJS.enc.Utf8;
        case "Utf16":
          return CryptoJS.enc.Utf16;
        default:
          reject("No valid encoding specified.");
          return false;
      }
    };

    if (length % 8 != 0 && length > 2048)
      reject("Length must be a multiple of 8 and less than or equal to 2048.");

    try {
      resolve(
        CryptoJS.SHA3(seed, { outputLength: length }).toString(
          setEncoding(encoding)
        )
      );
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Brief description of the function here.
 * @summary encrypt the field given the options. Default options provided.
 * @param {String} plainField - field to encrypt.
 * @param {String} secretPassPhrase - passphrase for generating the key.
 * @param {Object} options - options. Options include passphrase for key, key size, initial value seed, initial value encoding, initial value length.
 * @return {FormatterObject} A formatter object containing ciphertext, cipheriv, cipher seed.
 */
exports.encrypt = async function encryptField(
  plainField,
  secretPassPhrase,
  providedOptions
) {
  //We thusly spead out both the objects merge them.
  const options = { ...defaultOptions, ...providedOptions };

  const key = await generateKey(secretPassPhrase, options.keySize);
  const iv = await generateIv(options.seed, options.encoding, options.length);

  const encrypted = CryptoJS.AES.encrypt(plainField, key, {
    iv: iv,
    format: Formatter,
  });

  return JSON.parse(encrypted);
};

/**
 * Brief description of the function here.
 * @summary Decrypt the field.
 * @param {FormatterObject} cipherField - the cipher field to decrypt.
 * @param {String} secretPassPhrase - password phrase to generate the key with.
 * @return {ReturnValueDataTypeHere} Brief description of the returning value here.
 */
exports.decrypt = async function decryptField(
  cipherField,
  secretPassPhrase,
  keySize
) {
  const key = await generateKey(secretPassPhrase, keySize);
  const iv = cipherField.iv;

  const decrypted = CryptoJS.AES.decrypt(cipherField, key, {
    iv: iv,
    format: Formatter,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};
