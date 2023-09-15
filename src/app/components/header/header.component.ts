import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ContractService } from 'src/app/services/contract.service';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  address!: string;
  balance! : Observable<string>;
  constructor(
    public walletService: WalletService,
    ) {}

  async ngOnInit(): Promise<void> {
    this.connectWallet()
     this.walletService.address$.subscribe((resp) => {
      this.address = resp.slice(0, 6) + '...' + resp.slice(-4);
      console.log(resp);
    });
    
    this.balance =  this.walletService.ethBalance$;
  }

   walletToggle() {
    if(!this.address) {
     this.connectWallet();
      return;
    }
    this.address = '';
    this.balance = of('0');

    
  }
  async connectWallet() {
    await this.walletService.connectWalletWithAlchemy();  
  }
  getAddress() {
    return this.address;
  }
  

}
