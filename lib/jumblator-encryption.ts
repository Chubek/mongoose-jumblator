import CryptoJS from 'crypto-js';
import { jsonFormatter } from './json-formatter';
import { encodings, keySizes, defaultOptions } from './consts';
import { Encoding, KeySize, Options } from './types';

// Get the encoding.
export const getEncoding = (encoding: Encoding) => {
  if (!encodings.includes(encoding)) {
    throw new Error(`Encoding must be ${encodings}. Yours is ${encoding}`);
  }

  return encoding;
};

/**
 * Generates the necessary key for the encryption.
 */
const generateKey = async (secretPassPhrase: string, keySize: KeySize, encoding: Encoding, salt: string) => {
  // Check if param is valid.
  if (!keySizes.includes(keySize)) {
    throw new Error(`Key size must be ${keySizes}. But your keySize is ${keySize}`);
  }

  // Generating the key.
  const key = CryptoJS.PBKDF2(secretPassPhrase, salt, {
    keySize
  }).toString();
  // This doesn't work as it wants an encoder not a string?
  // }).toString(getEncoding(encoding));

  return key;
}

/**
 * Generates an initial value for the encryption process.
 */
export const generateIv = async (seed: string, encoding: Encoding, length: number) => {
  if ((length % 8 != 0) || length > 2048) {
    throw new Error('Length must be a multiple of 8 and less than or equal to 2048.');
  }

  const key = CryptoJS.SHA3(seed, { outputLength: length });
  // Following doesn't work as it wants an encoder not a string
  // const key = CryptoJS.SHA3(seed, { outputLength: length }).toString(getEncoding(encoding));
  return key;
}

/**
 * Encrypt the field.
 */
export const encryptField = async (plainField: string, secretPassPhrase: string, providedOptions: Options) => {
  const options = { ...defaultOptions, ...providedOptions };
  const key = await generateKey(secretPassPhrase, options.keySize, options.encoding, options.keySalt);
  const iv = await generateIv(options.seed, options.encoding, options.length);

  const encrypted = CryptoJS.AES.encrypt(plainField, key, {
    iv,
    format: jsonFormatter
  });

  return encrypted.toString();
};

/**
 * Decrypt the field.
 */
export const decryptField = async(cipherField: string, secretPassPhrase: string, providedOptions: Options) => {
  const options = { ...defaultOptions, ...providedOptions };

  const key = await generateKey(
    secretPassPhrase,
    options.keySize,
    options.encoding,
    options.keySalt
  );

  const decrypted = CryptoJS.AES.decrypt(cipherField, key, {
    format: jsonFormatter
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Generates the search hash.
 */
export const generateSearchHash = (field: string) => CryptoJS.SHA256(field);