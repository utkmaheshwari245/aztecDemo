const utils = require('@aztec/dev-utils');

const ACE = artifacts.require('./ACE.sol');
const JoinSplitFluid = artifacts.require('./JoinSplitFluid.sol');
const JoinSplit = artifacts.require('./JoinSplit.sol');
const ZkAssetMintable = artifacts.require('./ZkAssetMintable.sol');

const {constants, proofs : {JOIN_SPLIT_PROOF, MINT_PROOF}} = utils;

module.exports = async (deployer) => {
    await deployer.deploy(ACE);
    await deployer.deploy(JoinSplitFluid);
    await deployer.deploy(JoinSplit);

    const ACEInstance = await ACE.deployed();
    const JoinSplitFluidInstance = await JoinSplitFluid.deployed();
    const JoinSplitInstance = await JoinSplit.deployed();
    await ACEInstance.setCommonReferenceString(constants.CRS);
    await ACEInstance.setProof(MINT_PROOF, JoinSplitFluidInstance.address);
    await ACEInstance.setProof(JOIN_SPLIT_PROOF, JoinSplitInstance.address);

    await deployer.deploy(ZkAssetMintable, ACEInstance.address, '0x0000000000000000000000000000000000000000', 1);
};
