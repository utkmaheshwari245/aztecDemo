import utils from '@aztec/dev-utils';

const aztec = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');

const Ace = artifacts.require('./Ace.sol');
const ZkAssetMintable = artifacts.require('./ZkAssetMintable.sol');
const ERC20Mintable = artifacts.require('./ERC20Mintable.sol');

const {proofs : {MINT_PROOF}} = utils;
const {JoinSplitProof, MintProof} = aztec;

contract('Test Aztec Privacy Protocol with ERC20 tokens', accounts => {

    it('Test Unilateral Transfer of ERC20 tokens using Aztec protocol', async() => {
        const AceInstance = await Ace.deployed();
        const ZkAssetMintableInstance = await ZkAssetMintable.deployed();
        const ERC20MintableInstance = await ERC20Mintable.deployed();

        const alice = secp256k1.generateAccount();
        const bob = secp256k1.generateAccount();
        await ERC20MintableInstance.mint(accounts[1], 100);
        await ERC20MintableInstance.mint(accounts[2], 0);
        const amount = 25;

        console.log('Alice\'s balance : ' + await ERC20MintableInstance.balanceOf(accounts[1]));
        console.log('Bob\'s balance : ' + await ERC20MintableInstance.balanceOf(accounts[2]));

        console.log('Mint Aztec Note worth 0 for Alice');
        const zeroValueNote = await aztec.note.createZeroValueNote();
        const alice0Note = await aztec.note.create(alice.publicKey, 0);
        const proof1 = new MintProof(zeroValueNote, alice0Note, [alice0Note], ZkAssetMintableInstance.address);
        const data1 = proof1.encodeABI();
        await ZkAssetMintableInstance.confidentialMint(MINT_PROOF, data1);

        console.log('Convert Alice\'s ERC20 Tokens worth ' + amount + ' to Alice\'s Aztec Note worth ' + amount);
        const alice25Note = await aztec.note.create(alice.publicKey, amount);
        const proof2 = new JoinSplitProof([alice0Note], [alice25Note], accounts[0], -amount, accounts[1]);
        const data2 = proof2.encodeABI(ZkAssetMintableInstance.address);
        const signatures2 = proof2.constructSignatures(ZkAssetMintableInstance.address, [alice]);
        await ERC20MintableInstance.approve(AceInstance.address, amount, {from: accounts[1]});
        await AceInstance.publicApprove(ZkAssetMintableInstance.address, proof2.hash, amount, {from:accounts[1]});
        await ZkAssetMintableInstance.confidentialTransfer(data2, signatures2);

        console.log('Alice\'s balance : ' + await ERC20MintableInstance.balanceOf(accounts[1]));
        console.log('Bob\'s balance : ' + await ERC20MintableInstance.balanceOf(accounts[2]));

        console.log('Convert Alice\'s Aztec Note worth ' + amount + ' to Bob\'s ERC20 Tokens worth ' + amount);
        const bob0Note = await aztec.note.create(bob.publicKey, 0);
        const proof3 = new JoinSplitProof([alice25Note], [bob0Note], accounts[0], amount, accounts[2]);
        const data3 = proof3.encodeABI(ZkAssetMintableInstance.address);
        const signatures3 = proof3.constructSignatures(ZkAssetMintableInstance.address, [alice]);
        await ZkAssetMintableInstance.confidentialTransfer(data3, signatures3);

        console.log('Alice\'s balance : ' + await ERC20MintableInstance.balanceOf(accounts[1]));
        console.log('Bob\'s balance : ' + await ERC20MintableInstance.balanceOf(accounts[2]));
    });
});
