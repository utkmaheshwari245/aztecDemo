import utils from '@aztec/dev-utils';

const aztec = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

const ZkAssetMintable = artifacts.require('./ZkAssetMintable.sol');
const {proofs : {MINT_PROOF}} = utils;
const {JoinSplitProof, MintProof} = aztec;

contract('Test Aztec Privacy Protocol', accounts => {
    const alice = secp256k1.generateAccount();
    const bob = secp256k1.generateAccount();
    const charlie = secp256k1.generateAccount();

    it('Simulate Minting and Unilateral Transfer', async() => {
        const ZkAssetMintableInstance = await ZkAssetMintable.deployed();
  
        console.log('Give Alice notes worth 100');
        const zeroValueNote = await aztec.note.createZeroValueNote();
        const alice100Note = await aztec.note.create(alice.publicKey, 100);
        const mintProof = new MintProof(zeroValueNote, alice100Note, [alice100Note], ZkAssetMintableInstance.address);
        const mintData = mintProof.encodeABI();
        const mint = await ZkAssetMintableInstance.confidentialMint(MINT_PROOF, mintData);
        console.log(mint.receipt);
        console.log('Successfully given notes worth 100 to Alice');

        console.log('Transfer notes worth 25 from Alice to Bob');
        const alice75Note = await aztec.note.create(alice.publicKey, 75);
        const bob25Note = await aztec.note.create(bob.publicKey, 25);
        const transferProof1 = new JoinSplitProof([alice100Note], [alice75Note, bob25Note], accounts[0], 0, accounts[0]);
        const transferProofData1 = transferProof1.encodeABI(ZkAssetMintableInstance.address);
        const transferProofSignatures1 = transferProof1.constructSignatures(ZkAssetMintableInstance.address, [alice]);
        const transfer1 = await ZkAssetMintableInstance.confidentialTransfer(transferProofData1, transferProofSignatures1);
        console.log(transfer1.receipt);
        console.log('Successfully transferred notes worth 25 from Alice to Bob');

        console.log('Transfer notes worth 30 from Bob to Charlie');
        const bob10Note = await aztec.note.create(bob.publicKey, 10);
        const charlie15Note = await aztec.note.create(charlie.publicKey, 15);
        const transferProof2 = new JoinSplitProof([bob25Note], [charlie15Note, bob10Note], accounts[0], 0, accounts[0]);
        const transferProofData2 = transferProof2.encodeABI(ZkAssetMintableInstance.address);
        const transferProofSignatures2 = transferProof2.constructSignatures(ZkAssetMintableInstance.address, [bob]);
        const transfer2 = await ZkAssetMintableInstance.confidentialTransfer(transferProofData2, transferProofSignatures2);
        console.log(transfer2.receipt);
        console.log('Successfully transferred notes worth 30 from Bob to Alice');
    });
});
