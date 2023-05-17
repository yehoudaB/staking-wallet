
import {expect} from 'chai';
import {ethers} from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
// example test
describe('MultiSigWallet', function () {
    async function deployFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        const MultiSigWallet = await ethers.getContractFactory('MultiSigWallet');
        const multiSigWallet = await MultiSigWallet['deploy'](['0x3e122A3dB43d225DD5BFFD929AD4176ce69117E0', 
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        '0xC5e0B6E472dDE70eCEfFa4c568Bd52f2A7a1632A']
        , 2);
        return { multiSigWallet, owner, otherAccount };
    }

    describe('Deployment', function () {
        it('should deploy the contract and set the owner to be the deployer address', async function () {
            const { multiSigWallet , owner } = await loadFixture(deployFixture);
            expect(await multiSigWallet['isOwner'](owner.address)).to.equal(true);
        });
    });
    describe('Balance', function () {
        it('should return 0 ether for the contract balance', async function () {
            const { multiSigWallet , owner } = await loadFixture(deployFixture);
            expect(await multiSigWallet['balanceOf']()).to.equal(0);
        });
        it('should return 1 ether for the contract balance', async function () {
            const { multiSigWallet , owner } = await loadFixture(deployFixture);
            const amount = ethers.utils.parseEther('1');
            await multiSigWallet['deposit']({value: amount});
            expect(await multiSigWallet['balanceOf']()).to.equal(amount);
        }
        );
    });

    
    describe('Send', function () {

    });     

    describe('Deposit', function () {
        it('should deposit 1 ether to the contract', async function () {
            const { multiSigWallet , owner } = await loadFixture(deployFixture);
            const amount = ethers.utils.parseEther('1');
            await multiSigWallet['deposit']({value: amount});
            expect(await multiSigWallet['balanceOf']()).to.equal(amount);
        });
    });
    describe('createWithdraw', function () {
        it('should create a withdraw request', async function () {
            const { multiSigWallet , owner } = await loadFixture(deployFixture);
            const amount = ethers.utils.parseEther('1');
            await multiSigWallet['deposit']({value: amount});
            await multiSigWallet['createWithdraw'](owner.address, amount);
            expect(await multiSigWallet['balanceOf']()).to.equal(amount);
        });
    });

    describe('approveWithdrawTx', function () {
        it('should approve a withdraw request', async function () {
            const { multiSigWallet , owner } = await loadFixture(deployFixture);
            const amount = ethers.utils.parseEther('1');
            await multiSigWallet['deposit']({value: amount});
            await multiSigWallet['createWithdraw'](owner.address, amount);
            await multiSigWallet['approveWithdrawTx'](0);
            const tx =  await multiSigWallet['getWithdrawTx'](0);
            expect(await tx.approvals).to.equal(1);
        });
    },);

    describe('getWithdrawTxCount', function () {
        it('should return the number of withdraw requests', async function () {
            const { multiSigWallet , owner } = await loadFixture(deployFixture);
            const amount = ethers.utils.parseEther('1');
            await multiSigWallet['deposit']({value: amount});
            await multiSigWallet['createWithdraw'](owner.address, amount);
            expect(await multiSigWallet['getWithdrawTxCount']()).to.equal(1);
        });
    },);


});


