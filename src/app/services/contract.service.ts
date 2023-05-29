import { Injectable } from '@angular/core';
import {  errors, ethers } from 'ethers';
import   StakingContract  from '../../artifacts/contracts/StakingContract.sol/StakingContract.json';
import { BehaviorSubject } from 'rxjs';
import { AlchemyService } from './alchemy.service';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private contractAddress = '0x68B1D87F95878fE05B998F19b66F4baba5De1aed';
  
  private ethBalanceSubject = new BehaviorSubject<string>('0');
  
  ethBalance$= this.ethBalanceSubject.asObservable();
  
  private responseSubject = new BehaviorSubject<any>('');
  response$= this.responseSubject.asObservable();
  private listWalletsSubject = new BehaviorSubject<any>([]);
  listWallets$= this.listWalletsSubject.asObservable();
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = this.provider.getSigner();
  contract = new ethers.Contract(this.contractAddress, StakingContract.abi, this.signer);
  
  constructor(
    private walletService: WalletService,
    private alchemyService: AlchemyService ) {
     //this.getContractBallanceWithAlchemy(); //not working in localhost
     this.getContractBallanceWithEther();
     this.getWallets();
   }



  async getContractBallanceWithEther() {
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    const contract = await new ethers.Contract(this.contractAddress, StakingContract.abi, provider);
    this.ethBalanceSubject.next(ethers.utils.formatEther(await contract['balanceOf']()));
  }   
  async getContractBallanceWithAlchemy() { //not working in localhost
    const balance = await this.alchemyService.alchemy.core.getBalance(this.contractAddress);
    this.ethBalanceSubject.next(ethers.utils.formatEther( balance));
  }    

  async getWalletBalance(index: number) {
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    const contract = await new ethers.Contract(this.contractAddress, StakingContract.abi, provider);
    return ethers.utils.formatEther(await contract['walletBalance'](index));
  }
  
  async CreateWallet()  {
    try{
      const transaction = await this.contract['walletCreate']();
      await transaction.wait();
      await this.walletService.connectWalletWithAlchemy();
      this.responseSubject.next( {reason: 'Wallet created'});
      this.getWallets();
    } catch (error) {
      console.log(error);
      this.responseSubject.next(error);
    }
  }


  async deposit(index: number)  {
    console.log(index);
    try{
      const transaction = await  this.contract['walletDeposit'](index, {value: ethers.utils.parseEther('1')});
      await transaction.wait();
      await this.walletService.connectWalletWithAlchemy();
     // await this.getContractBallanceWithAlchemy(); // no working in localhost
      await this.getContractBallanceWithEther();
      this.responseSubject.next( {reason: 'Deposit successful'});
    } catch (error) {
      console.log(error);
      this.responseSubject.next(error);
    }
  }   
 
  async withdraw(amount: number)  {
    try{
      
      const transaction = await this.contract['createWithdraw']( this.signer.getAddress(), ethers.utils.parseEther(amount.toString()));
      await transaction.wait();
      await this.walletService.connectWalletWithAlchemy();
      await this.getContractBallanceWithAlchemy();
      this.responseSubject.next( {reason: 'withdrawal created'});
    //  this.getWithdrawTxs();
    } catch (error) {
      console.log(error);
      this.responseSubject.next(error);
    }
  }  
  
  async getWallets() {
    this.listWalletsSubject.next(await this.contract['getWallets']());
  }
  async approveWithdraw(index: number) {
    try{

    const transaction = await  this.contract['approveWithdrawTx'](index);
    await transaction.wait();
  //  this.getWithdrawTxs();
    //this.getContractBallanceWithEther();
    await this.getContractBallanceWithAlchemy();
    this.responseSubject.next( {reason: 'withdrawal approved'});
    }
    catch (error : any) {
      
      console.log(error.method);
      
      if(error.method.includes('estimateGas')) {
        console.log('ddddddddddd')
        this.responseSubject.next( {reason: 'not enough funds in contract'});
        return
      }
     
      this.responseSubject.next( error );
    }
  }

  public getContractAddress() {
    return this.contractAddress;
  } 

}
