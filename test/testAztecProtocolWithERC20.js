import utils from '@aztec/dev-utils';

const aztec = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

const Ace = artifacts.require('./Ace.sol');
const ZkAssetMintable = artifacts.require('./ZkAssetMintable.sol');
const ERC20Mintable = artifacts.require('./ERC20Mintable.sol');

const {proofs : {MINT_PROOF}} = utils;
const {JoinSplitProof, MintProof} = aztec;

contract('Test Aztec Privacy Protocol', accounts => {

    it('Simulate Minting and Unilateral Transfer', async() => {
        const AceInstance = await Ace.deployed();
        const ZkAssetMintableInstance = await ZkAssetMintable.deployed();
        const ERC20MintableInstance = await ERC20Mintable.deployed();

        const alice = secp256k1.generateAccount();
        const bob = secp256k1.generateAccount();
        await ERC20MintableInstance.mint(accounts[1], 100);
        await ERC20MintableInstance.mint(accounts[2], 0);
        await ERC20MintableInstance.approve(AceInstance.address, 100, {from: accounts[1]});
        console.log('Alice : ' + await ERC20MintableInstance.balanceOf(accounts[1]));
        console.log('Bob : ' + await ERC20MintableInstance.balanceOf(accounts[2]));

        console.log('Give Alice notes worth 0');
        const zeroValueNote = await aztec.note.createZeroValueNote();
        const alice0Note = await aztec.note.create(alice.publicKey, 0);
        const mintProof = new MintProof(zeroValueNote, alice0Note, [alice0Note], ZkAssetMintableInstance.address);
        const mintData = mintProof.encodeABI();
        const mint = await ZkAssetMintableInstance.confidentialMint(MINT_PROOF, mintData);
//        console.log(mint.receipt);
        console.log('Successfully given notes worth 100 to Alice');

        console.log('Transfer notes worth 25 from Alice to Bob');
        const alice25Note = await aztec.note.create(alice.publicKey, 25);
        const sendProof = new JoinSplitProof([alice0Note], [alice25Note], accounts[0], -25, accounts[1]);
        console.log(sendProof);
        const temp = await AceInstance.publicApprove(ZkAssetMintableInstance.address, sendProof.hash, 25, {from:accounts[1]});
        const sendProofData = sendProof.encodeABI(ZkAssetMintableInstance.address);
        const sendProofSignatures = sendProof.constructSignatures(ZkAssetMintableInstance.address, [alice]);
        const transfer = await ZkAssetMintableInstance.confidentialTransfer(sendProofData, sendProofSignatures);
        console.log('Successfully transferred notes worth 25 from Alice to Bob');
    });
});
