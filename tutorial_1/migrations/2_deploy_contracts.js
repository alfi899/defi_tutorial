const TokenFarm = artifacts.require("TokenFarm");
const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("Dapptoken");

module.exports = async function(deployer, network, accounts) {
  // deploay Mock DAI Token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()
  
  // deploay Dapp Token
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()
  
  // Deploy tokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  // Transfer all tokens to TokenFarm (1 million)
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // Transfer 100 Mok DAI token to inverstor
  await daiToken.transfer(accounts[1], "100000000000000000000")
};
