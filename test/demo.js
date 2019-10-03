import utils from '@aztec/dev-utils';

const aztec = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

const ZkAssetMintable = artifacts.require('./ZkAssetMintable.sol');
const {proofs : {MINT_PROOF}} = utils;
const {JoinSplitProof, MintProof} = aztec;

contract('Test Aztec Privacy Protocol', accounts => {
    const bob = secp256k1.generateAccount();
    const sally = secp256k1.generateAccount();

    it('Simulate Minting and Unilateral Transfer', async() => {
        const ZkAssetMintableInstance = await ZkAssetMintable.deployed();
  
        console.log('Give Bob notes worth 100');
        const bobNote1 = await aztec.note.create(bob.publicKey, 100);
        const currentTotalValueNote = await aztec.note.createZeroValueNote();
        const newTotalValueNote = bobNote1;
        const mintedNotes = [bobNote1];
        const senderForMinting = ZkAssetMintableInstance.address;
        const mintProof = new MintProof(currentTotalValueNote, newTotalValueNote, mintedNotes, senderForMinting);
        const mintData = mintProof.encodeABI();
        const mint = await ZkAssetMintableInstance.confidentialMint(MINT_PROOF, mintData);
        console.log(mint.logs);
        console.log('Successfully given notes worth 100 to Bob');

        console.log('Transfer notes worth 25 from Bob to Sally');
        const bobNote2 = await aztec.note.create(bob.publicKey, 75);
        const sallyNote1 = await aztec.note.create(sally.publicKey, 25);
        const inputNotes = [bobNote1];
        const outputNotes = [bobNote2, sallyNote1];
        const senderForTransfer = accounts[0];
        const publicValue = 0;
        const publicOwner = bob.address;
        const sendProof = new JoinSplitProof(inputNotes, outputNotes, senderForTransfer, publicValue, publicOwner);
        const sendProofData = sendProof.encodeABI(ZkAssetMintableInstance.address);
        const sendProofSignatures = sendProof.constructSignatures(ZkAssetMintableInstance.address, [bob]);
        const transfer = await ZkAssetMintableInstance.confidentialTransfer(sendProofData, sendProofSignatures);
        console.log(transfer.logs);
        console.log('Successfully transferred notes worth 25 from Bob to Sally');
    });
});
