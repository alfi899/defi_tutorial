//const _deploy_contracts = require("../migrations/2_deploy_contracts");

const { default: Web3 } = require("web3");

const TokenFarm = artifacts.require("TokenFarm");
const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("Dapptoken");

require("chai")
    .use(require("chai-as-promised"))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, "ether");
}

contract("TokenFarm", ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm

    before(async () => {
        // Load contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)
    
        // Transfer all Dapp tokebs to farm (1 million)
        await dappToken.transfer(tokenFarm.address, tokens("1000000"))

        // send tokens to investor
        await daiToken.transfer(investor, tokens("100"), { from: owner })
    })


    // Write tests here
    describe("Mock DAI deployment", async () => {
        it("has a name", async () => {
            const name = await daiToken.name()
            assert.equal(name, "Mock DAI Token")
        })
    })


    describe("Dapp Token deployment", async () => {
        it("has a name", async () => {
            const name = await dappToken.name()
            assert.equal(name, "DApp Token")
        })
    })

    describe("Token Farm deployment", async () => {
        it("has a name", async () => {
            const name = await tokenFarm.name()
            assert.equal(name, "Dapp token Farm")
        })

        it("contract has tokens", async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens("1000000"))
        })
    })

    describe("Farming Tokens", async () => {
        it("rewards investors for stacking mDai tokens", async () => {
            let result

            // Check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens("100"), "investor Mock DAI wallet balance correct before staking")
            
            // Stake Mock Tokens
            await daiToken.approve(tokenFarm.address, tokens("100"), { from: investor })
            await tokenFarm.stakeTokens(tokens("100"), { from: investor })
            
            // Check stacking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens("0"), "investor Mock DAI wallet balance correct before staking")
             
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens("100"), "Token Farm Mock DAI wallet balance correct before staking")
            
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens("100"), "investor staking balance correct after staking")
             
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), "true", "investor staking status correct after staking")
          
            
            // Issue Tokes
            await tokenFarm.issueTokens({ from: owner })

            // Check balance after issues
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens("100"), "investor DApp Token wallet balance after issueance")

            // ensure that only owner can issue token
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

            // unstake tokens 
            await tokenFarm.unstakeTokens({from: investor})

            // check results after unstaking 
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens("100"), "investor Mock DAI wallet balance correct after staking")

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens("0"), "Token Farm Mock DAI balance correct after staking")

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens("0"), "investor staking balance correct after staking")

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), "false", "investor staking status correct after staking")
        })
    })
})