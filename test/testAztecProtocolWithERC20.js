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

        //setup
        const AceInstance = await Ace.deployed();
        const ZkAssetMintableInstance = await ZkAssetMintable.deployed();
        const ERC20MintableInstance = await ERC20Mintable.deployed();
        const aliceEthereumAccount = accounts[1];
        const bobEthereumAccount = accounts[2];
        const aliceAztecAccount = secp256k1.generateAccount();
        const bobAztecAccount = secp256k1.generateAccount();
        const transferAmount = 25;

        //initialize
        await ERC20MintableInstance.mint(aliceEthereumAccount, 100);
        await ERC20MintableInstance.mint(bobEthereumAccount, 0);
        const zeroValueNote = await aztec.note.createZeroValueNote();
        const alice0Note = await aztec.note.create(aliceAztecAccount.publicKey, 0);
        await ZkAssetMintableInstance.confidentialMint(MINT_PROOF, new MintProof(zeroValueNote, alice0Note, [alice0Note], ZkAssetMintableInstance.address).encodeABI());

        console.log('Alice\'s balance : ' + await ERC20MintableInstance.balanceOf(aliceEthereumAccount));
        console.log('Bob\'s balance : ' + await ERC20MintableInstance.balanceOf(bobEthereumAccount));

        //step 1
        console.log('Convert Alice\'s ERC20 Tokens worth ' + transferAmount + ' to Alice\'s Aztec Note worth ' + transferAmount);
        const alice25Note = await aztec.note.create(aliceAztecAccount.publicKey, transferAmount);
        const proof2 = new JoinSplitProof([alice0Note], [alice25Note], accounts[0], -transferAmount, aliceEthereumAccount);
        const data2 = proof2.encodeABI(ZkAssetMintableInstance.address);
        const signatures2 = proof2.constructSignatures(ZkAssetMintableInstance.address, [aliceAztecAccount]);
        await ERC20MintableInstance.approve(AceInstance.address, transferAmount, {from: aliceEthereumAccount});
        await AceInstance.publicApprove(ZkAssetMintableInstance.address, proof2.hash, transferAmount, {from:aliceEthereumAccount});
        await ZkAssetMintableInstance.confidentialTransfer(data2, signatures2);

        console.log('Alice\'s balance : ' + await ERC20MintableInstance.balanceOf(aliceEthereumAccount));
        console.log('Bob\'s balance : ' + await ERC20MintableInstance.balanceOf(bobEthereumAccount));

        //step 2
        console.log('Convert Alice\'s Aztec Note worth ' + transferAmount + ' to Bob\'s ERC20 Tokens worth ' + transferAmount);
        const bob0Note = await aztec.note.create(bobAztecAccount.publicKey, 0);
        const proof3 = new JoinSplitProof([alice25Note], [bob0Note], accounts[0], transferAmount, bobEthereumAccount);
        const data3 = proof3.encodeABI(ZkAssetMintableInstance.address);
        const signatures3 = proof3.constructSignatures(ZkAssetMintableInstance.address, [aliceAztecAccount]);
        await ZkAssetMintableInstance.confidentialTransfer(data3, signatures3);

        console.log('Alice\'s balance : ' + await ERC20MintableInstance.balanceOf(aliceEthereumAccount));
        console.log('Bob\'s balance : ' + await ERC20MintableInstance.balanceOf(bobEthereumAccount));
    });
});
