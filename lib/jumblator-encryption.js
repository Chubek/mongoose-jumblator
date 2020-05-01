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

//Get the encoding.
const setEncoding = (encoding) => {
  if (Object.values(consts.ivEncEnum).indexOf(encoding) <= -1) {
    throw new Error(
      "Encoding must be Hex, Utf8, Utf16 or Base 64. Yours is " + encoding
    );
  }
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

/**
 * Brief description of the function here.
 * @summary Generates the necessary key for the encryption.
 * @param {String} secretPassPhrase - the pass phrase.
 * @param {Int} keySize - The size of the key in bits. Must be 128, 256, or 512.'
 * @promise fPromise
 * @reject {Error} key size must fit.
 * @fulfill {CryptoJS.lib.WordArray} key.
 * @return {Promise.CryptoJS.lib.WordArray} The returned data is a WordArray object which can only be used in CryptoJS. So don't use it anywhere else!
 */
function generateKey(secretPassPhrase, keySize, encoding, salt) {
  return new Promise((resolve, reject) => {
    //Check if param is valid.
    if (Object.values(consts.keySizeEnum).indexOf(keySize) <= -1) {
      reject(
        "Key size must be 128, 256, or 512. But your keySize is " + keySize
      );
    }
    console.log("keySize", keySize);
    //Generating the key.
    try {
      resolve(
        CryptoJS.PBKDF2(secretPassPhrase, salt, {
          keySize: keySize,
        }).toString(setEncoding(encoding))
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
 * @promise fPromise
 * @reject {Error}
 * @fullfill {String}
 * @return {Promise.String} A string as specified by your own encoding.
 */
function generateIv(seed, encoding, length) {
  return new Promise((resolve, reject) => {
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
async function encryptField(
  plainField,
  secretPassPhrase,
  providedOptions = {}
) {
  //We thusly spead out both the objects merge them.
  const options = { ...consts.defaultOptions, ...providedOptions };

  console.log("passEnc", secretPassPhrase);

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
 * @param {FormatterObject} cipherField - the cipher field to decrypt.
 * @param {String} secretPassPhrase - password phrase to generate the key with.
 * @param {int} keySize - keysize of generated key.
 * @return {ReturnValueDataTypeHere} Brief description of the returning value here.
 */
async function decryptField(
  cipherField,
  secretPassPhrase,
  options = consts.defaultOptions
) {
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

exports.encrypt = encryptField;
exports.decrypt = decryptField;
