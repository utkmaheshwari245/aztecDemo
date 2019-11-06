const aztec = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

contract('Test', accounts => {
    const alice = secp256k1.generateAccount();

    it('Test', async() => {

        const alice100Note = await aztec.note.create(alice.publicKey, 100, alice.address);
        const alice100NotePublicKey = alice100Note.getPublic();
        const alicePrivateKey = alice.privateKey;
        console.log(alice100NotePublicKey);
        console.log(alicePrivateKey);
        const newNote = aztec.note.derive(alice100NotePublicKey, alicePrivateKey);
        console.log(newNote);
    });
});
