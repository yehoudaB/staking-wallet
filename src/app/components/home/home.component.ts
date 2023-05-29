import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Data } from '@angular/router';
import { WithdrawTx } from 'src/app/models/WithdrawTx';
import { AlchemyService } from 'src/app/services/alchemy.service';
import { ContractService } from 'src/app/services/contract.service';
import { WalletService } from 'src/app/services/wallet.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements  OnInit{

walletAmount = '0';
 
withdrawTxs: WithdrawTx[] = [];
displayedColumns: string[] = ['address', 'walletValue', 'stakedAmount',  'action'];  
  constructor(
    public walletService: WalletService,
    public contractService: ContractService,
    public alchemyService: AlchemyService

    ) {}

  async ngOnInit(): Promise<void> {
    const a = await this.getWalletBalance(0);
    console.log(a);
  }

  createWallet() {
    this.contractService.CreateWallet();
  }
  async onDeposit(amount: HTMLInputElement) {
    console.log(amount.value)
    await this.contractService.deposit(Number(amount.value));
    amount.value = '';
  }
  async onWithdraw(amount: HTMLInputElement) {
    console.log(amount.value);
    await this.contractService.withdraw(Number(amount.value));
    amount.value = '';
  }

  async deposit(index : number) {
    this.contractService.deposit(index);
  }
  
  async getWalletBalance(index: number) {
   const a = await this.contractService.getWalletBalance(index)
    console.log(a);
    return a;
  }

  
}


