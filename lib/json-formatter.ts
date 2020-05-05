import CryptoJS from "crypto-js";
import { log } from "./log";

// @todo: fix this
type CipherParams = any;

const CryptoObjLib: any = CryptoJS.lib;

interface CipherJsonObject {
  s?: any;
  iv?: any;
  ct: any;
}

export const jsonFormatter = {
  stringify: (cipherParams: CipherParams) => {
    const jsonObj: CipherJsonObject = {
      ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64),
      ...(cipherParams.iv
        ? {
            iv: cipherParams.iv.toString(),
          }
        : {}),
      ...(cipherParams.salt
        ? {
            s: cipherParams.salt.toString(),
          }
        : {}),
    };

    return JSON.stringify(jsonObj);
  },
  parse: (jsonStr: string) => {
    log.debug("jsonstr", jsonStr);
    const jsonObj = JSON.parse(jsonStr);

    // @todo: Fix the following error
    // Property 'CipherParams' does not exist on type '{ WordArray: { create: (v: any) => LibWordArray; random: (v: number) => WordArray; }; }'.ts(2339)

    // Extract ciphertext from json object, and create cipher params object
    const cipherParams = CryptoObjLib["CipherParams"].create({
      ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct),
    });

    return {
      ...cipherParams,
      ...(jsonObj.iv
        ? {
            iv: CryptoJS.enc.Hex.parse(jsonObj.iv),
          }
        : {}),
      ...(jsonObj.s
        ? {
            salt: CryptoJS.enc.Hex.parse(jsonObj.s),
          }
        : {}),
    };
  },
};
