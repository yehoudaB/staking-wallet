
import {expect} from 'chai';
import {ethers} from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
// example test
describe('StakingContract', function () {
    async function deployFixture() {
      const StakingContract = await ethers.getContractFactory('StakingContract');
      const stakingContract = await StakingContract['deploy']();
      return stakingContract;
    }

    describe('Deployment', function () {
      it('should deploy StakingContract and create initial supply of lion tokens', async function () {
        const stakingContract = await loadFixture(deployFixture);
        expect(stakingContract.address).to.be.properAddress;
      });
    });

    it('should create a new wallet and add it to the stake wallets', async function () {
        const stakingContract = await loadFixture(deployFixture);
        const walletCountBefore = await (await stakingContract['getWallets']()).length
        const tx = await stakingContract['walletCreate']();
        const walletCountAfter = (await stakingContract['getWallets']()).length;
        expect(walletCountAfter).to.equal(walletCountBefore + 1);
      });
    });

