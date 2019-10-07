import utils from '@aztec/dev-utils';

const aztec = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

const ZkAssetMintable = artifacts.require('./ZkAssetMintable.sol');
const {proofs : {MINT_PROOF}} = utils;
const {JoinSplitProof, MintProof} = aztec;

contract('Test Aztec Privacy Protocol', accounts => {
    const alice = secp256k1.generateAccount();
    const bob = secp256k1.generateAccount();

    it('Simulate Minting and Unilateral Transfer', async() => {
        const ZkAssetMintableInstance = await ZkAssetMintable.deployed();
  
        console.log('Give Alice notes worth 100');
        const aliceNote1 = await aztec.note.create(alice.publicKey, 100);
        console.log(aliceNote1);
        const currentTotalValueNote = await aztec.note.createZeroValueNote();
        const newTotalValueNote = aliceNote1;
        const mintedNotes = [aliceNote1];
        const senderForMinting = ZkAssetMintableInstance.address;
        const mintProof = new MintProof(currentTotalValueNote, newTotalValueNote, mintedNotes, senderForMinting);
        const mintData = mintProof.encodeABI();
        const mint = await ZkAssetMintableInstance.confidentialMint(MINT_PROOF, mintData);
        console.log(senderForMinting);
        console.log(alice.address);
        console.log(mint);
        console.log('Successfully given notes worth 100 to Alice');

        console.log('Transfer notes worth 25 from Alice to Bob');
        const aliceNote2 = await aztec.note.create(alice.publicKey, 75);
        const bobNote1 = await aztec.note.create(bob.publicKey, 25);
        const inputNotes = [aliceNote1];
        const outputNotes = [aliceNote2, bobNote1];
        const senderForTransfer = accounts[0];
        const publicValue = 0;
        const publicOwner = alice.address;
        const sendProof = new JoinSplitProof(inputNotes, outputNotes, senderForTransfer, publicValue, publicOwner);
        const sendProofData = sendProof.encodeABI(ZkAssetMintableInstance.address);
        const sendProofSignatures = sendProof.constructSignatures(ZkAssetMintableInstance.address, [alice]);
        const transfer = await ZkAssetMintableInstance.confidentialTransfer(sendProofData, sendProofSignatures);
        console.log(transfer.logs);
        console.log('Successfully transferred notes worth 25 from Alice to Bob');
    });
});
