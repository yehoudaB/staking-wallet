// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "./Wallet.sol";


contract StakingContract is ERC20 {
    event WalletCreate(uint256 walletid, address _address);
    event WalletDeposit(uint256 walletid, uint256 amount);
    event StakeEth(uint256 walletid, uint256 amount, uint256 startTime);
    event UnStakeEth(uint256 walletid, uint256 amount, uint256 numStocksReward);
    event WalletWithdraw(uint256 walletid, address _to, uint256 amount);

    using EnumerableMap for EnumerableMap.UintToAddressMap;

    struct StakeWallet {
        Wallet wallet;
        uint256 stakedAmount;
        uint256 startTime;
        uint256 endTime;
    }
    

    StakeWallet[] public  stakeWallets;
    EnumerableMap.UintToAddressMap private walletsStaked;
    uint256 public constant rewardPercentPerBlock = 1; 

    constructor() ERC20('Lion token', 'LION') {
    }
    
    function walletCreate() public returns (uint256 walletId, address walletAddress) {
        Wallet  newWallet =  new Wallet();
        stakeWallets.push(StakeWallet({
            wallet : newWallet,
            stakedAmount : 0,
            startTime: 0,
            endTime: 0
        }));
        uint256 newWalletId = stakeWallets.length - 1;
        address newWalletAddress = address(newWallet);
        emit WalletCreate(newWalletId, newWalletAddress);
        return (newWalletId, newWalletAddress);
    }

   

    function getWallets() public view returns (StakeWallet[] memory) {
        return stakeWallets;
    }

    function walletDeposit(uint256 _walletId) public payable  isWalletOwner(_walletId){
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        stakeWallet.wallet.deposit{value: msg.value}();
        emit WalletDeposit(_walletId, msg.value);
    }



    function walletBalance(uint256 _walletId) public view returns (uint256) {
       StakeWallet memory stakeWallet = stakeWallets[_walletId];
        return stakeWallet.wallet.balanceOf();
    }
    
    function walletWithdraw(
        uint256 _walletId,
        address payable _to,
        uint _amount
    ) public payable isWalletOwner(_walletId) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        stakeWallet.wallet.withdraw(_to, _amount);
        emit WalletWithdraw(_walletId, _to, _amount);
    }
    function stakeEth(uint256 _walletId) public isWalletOwner(_walletId) {
        StakeWallet storage  stakeWallet = stakeWallets[_walletId];
        uint256 currentBalance = walletBalance(_walletId);
        require(currentBalance > 0, "You do not have any ETH in your wallet, please fund your wallet before staking");
       
        stakeWallet.wallet.withdraw(payable(address(this)), currentBalance);
        uint256 stakedForBlocks = (block.timestamp - stakeWallet.startTime);
        uint256 totalUnclaimedRewards =  (stakeWallet.stakedAmount * stakedForBlocks * rewardPercentPerBlock ) / 100;
        _mint(msg.sender, totalUnclaimedRewards);

        stakeWallet.stakedAmount += currentBalance;
        stakeWallet.startTime = block.timestamp;
        stakeWallet.endTime = 0;
        walletsStaked.set(_walletId, address(stakeWallet.wallet));

        emit StakeEth(_walletId, currentBalance, block.timestamp);
        
    }

    function totalAddressesStaked() public view returns (uint256) {
        return walletsStaked.length();
    }

    function isWalletStaked(uint256 _walletId) public view returns (bool) {
        return walletsStaked.contains(_walletId);
    }

    function currentStake(uint256 _walletId) public view returns(uint256) {
        StakeWallet memory  stakeWallet = stakeWallets[_walletId];
        return stakeWallet.stakedAmount;
    }
    function currentRewards(uint256 _walletId) public view returns(uint256) {
        StakeWallet memory  stakeWallet = stakeWallets[_walletId];
        uint256 stakedForBlocks = (block.timestamp - stakeWallet.startTime);
        return (stakeWallet.stakedAmount * stakedForBlocks * rewardPercentPerBlock) / 100;
    }

    function unstakeEth(uint256 _walletId) public isWalletOwner(_walletId){
        StakeWallet storage  stakeWallet = stakeWallets[_walletId];
        require(stakeWallet.stakedAmount > 0, 'you have nothiong staked');
        payable(address( stakeWallet.wallet)).transfer(stakeWallet.stakedAmount);

        uint256 stakedForBlocks = (block.timestamp - stakeWallet.startTime);
        uint256 totalUnclaimedRewards =  (stakeWallet.stakedAmount * stakedForBlocks * rewardPercentPerBlock ) / 100;
        _mint(msg.sender, totalUnclaimedRewards);

        stakeWallet.stakedAmount = 0;
        stakeWallet.startTime = 0;
        stakeWallet.endTime = block.timestamp;
        walletsStaked.remove(_walletId);

        emit UnStakeEth(_walletId, stakeWallet.stakedAmount,totalUnclaimedRewards);

    }

     receive() external payable {}




    modifier isWalletOwner(uint256 _walletId){
        address payable  owner =  stakeWallets[_walletId].wallet.owner();
        require(owner == msg.sender , "your are not the owner of this wallet");
        _;
    }
}