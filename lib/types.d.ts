export type Encoding = 'Base64' | 'Hex' | 'Utf8' | 'Utf16';

export type KeySize = 128 | 256 | 512;

export interface DefaultOptions {
    keySize: KeySize;
    keySalt: string;
    seed: string;
    encoding: Encoding;
    length: number;
};

export type Options = DefaultOptions & {
    secret: string;
};
