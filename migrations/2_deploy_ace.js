const ACE = artifacts.require('./ACE.sol');
const JoinSplitFluid = artifacts.require('./JoinSplitFluid.sol');
const JoinSplit = artifacts.require('./JoinSplit.sol');

const utils = require('@aztec/dev-utils');

const {constants, proofs : {JOIN_SPLIT_PROOF, MINT_PROOF}} = utils;


module.exports = async (deployer) => {
    await deployer.deploy(ACE);
    await deployer.deploy(JoinSplitFluid);
    await deployer.deploy(JoinSplit);

    const ACEContract = await ACE.deployed(constants.CRS);
    await ACEContract.setCommonReferenceString(constants.CRS);
    await ACEContract.setProof(MINT_PROOF, JoinSplitFluid.address);
    await ACEContract.setProof(JOIN_SPLIT_PROOF, JoinSplit.address);
};
