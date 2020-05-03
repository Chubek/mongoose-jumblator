const CryptoJS = require("crypto-js");

module.exports = {
  stringify: function (cipherParams) {
    // create json object with ciphertext
    var jsonObj = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };

    // optionally add iv or salt
    if (cipherParams.iv) {
      jsonObj.iv = cipherParams.iv.toString();
    }

    if (cipherParams.salt) {
      jsonObj.s = cipherParams.salt.toString();
    }
    
    // stringify json object
    return JSON.stringify(jsonObj);
  },
  parse: function (jsonStr) {
    // parse json string
    console.log("jsonstr", jsonStr);
    var jsonObj = JSON.parse(jsonStr);

    // @todo: Fix the following error
    // Property 'CipherParams' does not exist on type '{ WordArray: { create: (v: any) => LibWordArray; random: (v: number) => WordArray; }; }'.ts(2339)

    // Extract ciphertext from json object, and create cipher params object
    var cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct),
    });

    // optionally extract iv or salt

    if (jsonObj.iv) {
      cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
    }

    if (jsonObj.s) {
      cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
    }
    

    return cipherParams;
  },
};
