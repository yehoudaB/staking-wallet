
import {expect} from 'chai';
import {ethers} from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { StakingContract } from 'typechain-types';
// example test
describe('StakingContract', function () {
    async function deployFixture() {
      const [user1, user2] = await ethers.getSigners()
      const StakingContract = await ethers.getContractFactory('StakingContract');
      const stakingContract: StakingContract = await StakingContract['deploy']();
      return { stakingContract, user1, user2 }
    }

    async function helperCreateWallet(staking: StakingContract) {
      const tx = await staking.walletCreate();
      const receipt = await tx.wait();
      const walletId = receipt?.events?.[0]?.args?.[0];
      const walletAddress = receipt?.events?.[0]?.args?.[1];
      return { walletId, walletAddress };
    }


    async function helperGetWallet(staking: StakingContract, index: number) {
      const stakeWallets = await staking.getWallets()
      return stakeWallets[index]
    }

  
    describe('Deployment', function () {
      it('should deploy StakingContract and create initial supply of lion tokens', async function () {
        const {stakingContract} = await loadFixture(deployFixture);
        expect(stakingContract.address).to.be.properAddress;
      });
    });
    
    describe('Create wallet', function () {
    it('should create a new wallet and add it to the stake wallets', async function () {
        const {stakingContract} = await loadFixture(deployFixture);
        const walletCountBefore = await (await stakingContract['getWallets']()).length
        const tx = await stakingContract['walletCreate']();
        const walletCountAfter = (await stakingContract['getWallets']()).length;
        expect(walletCountAfter).to.equal(walletCountBefore + 1);
      });
    });

    describe('walletDeposit', function () {
      it('Should deposit Ether to the Wallet contract', async function () {
        const { stakingContract } = await loadFixture(deployFixture)
        const { walletId, walletAddress } =  await helperCreateWallet(stakingContract)
        console.log('walletId', walletId, '. walletAddress', walletAddress)
        const tx = await stakingContract.walletDeposit(walletId, {value: ethers.utils.parseEther('1')})
        const receipt = await tx.wait()
        console.log('receipt', receipt)
        const wallet = await helperGetWallet(stakingContract, 0)
        
        // get balance of wallet
       const a = await stakingContract['walletBalance'](walletId)

        console.log('blc', a )
        const balance = await ethers.provider.getBalance(walletAddress)
       expect(balance).to.equal(ethers.utils.parseEther('1'))
      });
    });
   
  });

