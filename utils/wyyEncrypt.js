const crypto = require("crypto");

const iv = Buffer.from("0102030405060708");
const presetKey = Buffer.from("0CoJUm6Qyw8W8jud");
const base62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const publicKey =
    "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB\n-----END PUBLIC KEY-----";
anonymous_token =
    "bf8bfeabb1aa84f9c8c3906c04a04fb864322804c83f5d607e91a04eae463c9436bd1a17ec353cf780b396507a3f7464e8a60f4bbc019437993166e004087dd32d1490298caf655c2353e58daa0bc13cc7d5c198250968580b12c1b8817e3f5c807e650dd04abd3fb8130b7ae43fcc5b";

const aesEncrypt = (buffer, mode, key, iv) => {
    const cipher = crypto.createCipheriv("aes-128-" + mode, key, iv);
    return Buffer.concat([cipher.update(buffer), cipher.final()]);
};
const rsaEncrypt = (buffer, key) => {
    buffer = Buffer.concat([Buffer.alloc(128 - buffer.length), buffer]);
    return crypto.publicEncrypt(
        { key: key, padding: crypto.constants.RSA_NO_PADDING },
        buffer
    );
};
const weapi = (object) => {
    const text = JSON.stringify(object);
    const secretKey = crypto
        .randomBytes(16)
        .map((n) => base62.charAt(n % 62).charCodeAt());
    return {
        params: aesEncrypt(
            Buffer.from(
                aesEncrypt(Buffer.from(text), "cbc", presetKey, iv).toString(
                    "base64"
                )
            ),
            "cbc",
            secretKey,
            iv
        ).toString("base64"),
        encSecKey: rsaEncrypt(secretKey.reverse(), publicKey).toString("hex"),
    };
};

module.exports = {
    weapi,
};
