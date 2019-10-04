import utils from '@aztec/dev-utils';
import {encryptMessage, decryptMessage} from '../scripts/encryption.js';

const aztec = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

contract('Test Not encryption and decryption', accounts => {
    const alice = secp256k1.generateAccount();
    const bob = secp256k1.generateAccount();
    const charlie = secp256k1.generateAccount();
    let encryptedViewingKey;

    it('Create and Encrypt Note', async() => {
        const note = await aztec.note.create(alice.publicKey, 123);
        const viewingKey = note.exportNote().viewingKey;
        console.log(viewingKey);
        encryptedViewingKey = await encryptMessage(bob.publicKey, viewingKey);
        console.log(encryptedViewingKey);
    });

    it('Successful Decryption of Note', async() => {
        const viewingKey = await decryptMessage(bob.privateKey, encryptedViewingKey);
        console.log(viewingKey);
        const note = await aztec.note.fromViewKey(viewingKey);
        console.log(note.k.toNumber());
    });

    it('Unsuccessful Decryption of Note', async() => {
        const viewingKey = await decryptMessage(charlie.privateKey, encryptedViewingKey);
        console.log(viewingKey);
        const note = await aztec.note.fromViewKey(viewingKey);
        console.log(note.k.toNumber());
    });
});
