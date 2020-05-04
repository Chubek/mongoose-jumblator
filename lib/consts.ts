import { Encoding, KeySize, DefaultOptions } from './types';

export const encodings: Encoding[] = ['Base64', 'Hex', 'Utf8', 'Utf16'];

export const keySizes: KeySize[] = [128, 256, 512];

export const defaultOptions: DefaultOptions = {
  keySize: 256,
  keySalt: 'keySalt',
  seed: 'seed',
  encoding: 'Hex',
  length: 512
};