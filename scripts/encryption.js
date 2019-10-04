import EthCrypto from 'eth-crypto';

const secp256k1 = require('@aztec/secp256k1');

export const encryptMessage = async (publicKey, msg) => {
    const encrypted = await EthCrypto.encryptWithPublicKey(publicKey.slice(4), msg);
    return EthCrypto.cipher.stringify(encrypted);
};

export const decryptMessage = async (privateKey, encryptedMsg) => {
    return EthCrypto.decryptWithPrivateKey(privateKey, EthCrypto.cipher.stringify(encryptedMsg));
};
