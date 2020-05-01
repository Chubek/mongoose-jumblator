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
  keySalt: "keySalt",
  seed: "seed", //this must be passed!!
  encoding: "Hex",
  length: 512,
};
Object.freeze(defaultOptions);

exports.keySizeEnum = keySizeEnum;
exports.ivEncEnum = ivEncEnum;
exports.defaultOptions = defaultOptions;
