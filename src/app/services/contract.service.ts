import { Injectable } from '@angular/core';
import {  errors, ethers } from 'ethers';
import  MultiSigWallet  from '../../artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json';
import { BehaviorSubject, from } from 'rxjs';
import { WalletService } from './wallet.service';
import { AlchemyService } from './alchemy.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private contractAddress = '0x049E85a32eD5328bf13eaC75f62Df81615D9e48d';
  
  private ethBalanceSubject = new BehaviorSubject<string>('0');
  ethBalance$= this.ethBalanceSubject.asObservable();

  private responseSubject = new BehaviorSubject<any>('');
  response$= this.responseSubject.asObservable();
  private withdrawTxsSubject = new BehaviorSubject<any>([]);
  withdrawTxs$= this.withdrawTxsSubject.asObservable();
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = this.provider.getSigner();
  contract = new ethers.Contract(this.contractAddress, MultiSigWallet.abi, this.signer);
  
  constructor(
    private  walletService: WalletService,
    private alchemyService: AlchemyService ) {
     this.getContractBallanceWithAlchemy(); //not working in localhost
     //this.getContractBallanceWithEther();
     this.getWithdrawTxs();
   }



  async getContractBallanceWithEther() {
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    const contract = await new ethers.Contract(this.contractAddress, MultiSigWallet.abi, provider);
    this.ethBalanceSubject.next(ethers.utils.formatEther(await contract['balanceOf']()));
  }   
  async getContractBallanceWithAlchemy() { //not working in localhost
    const balance = await this.alchemyService.alchemy.core.getBalance(this.contractAddress);
    this.ethBalanceSubject.next(ethers.utils.formatEther( balance));
  }    


  async deposit(amount: number)  {
    try{
      const transaction = await this.contract['deposit']({value: ethers.utils.parseEther(amount.toString())});
      await transaction.wait();
      await this.walletService.connectWalletWithAlchemy();
      await this.getContractBallanceWithAlchemy(); // no working in localhost
     // await this.getContractBallanceWithEther();
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
      this.getWithdrawTxs();
    } catch (error) {
      console.log(error);
      this.responseSubject.next(error);
    }
  }  
  
  async getWithdrawTxs() {
    this.withdrawTxsSubject.next(await this.contract['getWithdrawTxes']());
  }
  async approveWithdraw(index: number) {
    try{

    const transaction = await  this.contract['approveWithdrawTx'](index);
    await transaction.wait();
    this.getWithdrawTxs();
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
