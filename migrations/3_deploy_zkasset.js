const ACE = artifacts.require('./ACE.sol');
const ZkAsset = artifacts.require('./ZkAsset.sol');
const ZkAssetMintable = artifacts.require('./ZkAssetMintable.sol');

module.exports = async (deployer) => {
  let aceContract = await ACE.deployed();
  await deployer.deploy(ZkAsset, aceContract.address, '0x0000000000000000000000000000000000000000', 1);
  await deployer.deploy(ZkAssetMintable, aceContract.address, '0x0000000000000000000000000000000000000000', 1);
};
