import utils from '@aztec/dev-utils';

const aztec = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

const ZkAssetMintable = artifacts.require('./ZkAssetMintable.sol');

const {proofs : {MINT_PROOF}} = utils;
const {JoinSplitProof, MintProof} = aztec;

contract('Test Aztec Privacy Protocol', accounts => {
    const alice = secp256k1.generateAccount();
    const bob = secp256k1.generateAccount();

    it('Test Unilateral Transfer using Aztec protocol', async() => {
        const ZkAssetMintableInstance = await ZkAssetMintable.deployed();
  
        console.log('Mint Aztec Note worth 100 for Alice');
        const zeroValueNote = await aztec.note.createZeroValueNote();
        const alice100Note = await aztec.note.create(alice.publicKey, 100);
        const proof1 = new MintProof(zeroValueNote, alice100Note, [alice100Note], ZkAssetMintableInstance.address);
        const data1 = proof1.encodeABI();
        await ZkAssetMintableInstance.confidentialMint(MINT_PROOF, data1);

        console.log('Transfer Aztec Note worth 25 from Alice to Bob');
        const alice75Note = await aztec.note.create(alice.publicKey, 75);
        const bob25Note = await aztec.note.create(bob.publicKey, 25);
        const proof2 = new JoinSplitProof([alice100Note], [alice75Note, bob25Note], accounts[0], 0, accounts[0]);
        const data2 = proof2.encodeABI(ZkAssetMintableInstance.address);
        const signatures2 = proof2.constructSignatures(ZkAssetMintableInstance.address, [alice]);
        await ZkAssetMintableInstance.confidentialTransfer(data2, signatures2);
    });
});
