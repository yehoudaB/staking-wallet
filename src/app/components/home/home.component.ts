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
[x: string]: any;
 
withdrawTxs: WithdrawTx[] = [];
displayedColumns: string[] = ['to', 'amount', 'approvals', 'sent', 'action'];  
  constructor(
    public walletService: WalletService,
    public contractService: ContractService,
    public alchemyService: AlchemyService

    ) {}

  async ngOnInit(): Promise<void> {
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

  async approveWithdraw(index : number) {
    this.contractService.approveWithdraw(index);
  }

}


