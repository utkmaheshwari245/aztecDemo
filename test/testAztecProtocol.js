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
        const sendProof = new JoinSplitProof([alice100Note], [alice75Note, bob25Note], accounts[0], 0, accounts[0]);
        const sendProofData = sendProof.encodeABI(ZkAssetMintableInstance.address);
        const sendProofSignatures = sendProof.constructSignatures(ZkAssetMintableInstance.address, [alice]);
        const transfer = await ZkAssetMintableInstance.confidentialTransfer(sendProofData, sendProofSignatures);
        console.log(transfer.receipt);
        console.log('Successfully transferred notes worth 25 from Alice to Bob');
    });
});
