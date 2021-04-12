pragma solidity >=0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    // All code here...
    string public name = "Dapp token Farm";
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;


    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // 1. Stake tokens (Deposit) (send daiTokens to TokenFarm)
    function stakeTokens(uint _amount) public {
        // require amount is grater than 0
        require(_amount > 0, "amount cannot be 0");
        
        // transfer Mock Dai tokens to this constract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // update stackingBalance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // add user to stakers array only if they haven't staked already
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;

    }


    // Issuing Tokens
    function issueTokens() public {
        //vonly owner can call this function
        require(msg.sender == owner, "caller must be the owner");

        // Issue tokens to all stakers
        for(uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if (balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }


    // Unstaking Tokans (Witdraw)
    function unstakeTokens() public {
        // Fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // require amount grater than 0
        require(balance >  0, "staking balance cannot be 0");

        // Transfer Mock Dai tokens to this contract for stacking
        daiToken.transfer(msg.sender, balance);

        // reset staking balance
        stakingBalance[msg.sender] = 0;

        // update staking status 
        isStaking[msg.sender] = false;
    }
    
}

