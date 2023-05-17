import { Injectable } from '@angular/core';
import {  ethers } from 'ethers';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { OwnedNftsResponse, TokenBalancesResponseErc20 } from 'alchemy-sdk';
@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private addressSubject = new BehaviorSubject<string>('');
  private ethBalanceSubject = new BehaviorSubject<string>('0');
  address$= this.addressSubject.asObservable();
  ethBalance$= this.ethBalanceSubject.asObservable();
  
  
  tokenBalance!: TokenBalancesResponseErc20;
  nfts!:OwnedNftsResponse;
  ethBalance!: ethers.BigNumber;
  
  constructor() { 
    this.connectWalletWithAlchemy();
  }

  
  async connectWalletWithEthers()  {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address =  await signer.getAddress();
    let balance  = await provider.getBalance(address);
    this.addressSubject.next(address);
    this.ethBalanceSubject.next(await  ethers.utils.formatEther(balance));
  }

  async connectWalletWithAlchemy()  {
    const address = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const balance = await window.ethereum.request({ method: 'eth_getBalance', params: [address[0], 'latest'] })
    
    this.addressSubject.next(address[0]);
    this.ethBalanceSubject.next(await  ethers.utils.formatEther(balance));

  }
  

 
}
