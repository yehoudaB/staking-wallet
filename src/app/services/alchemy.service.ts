import { Injectable } from '@angular/core';
import { Alchemy, AlchemyEventType, Network } from 'alchemy-sdk';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlchemyService {
  latestBlockSubject = new BehaviorSubject<number>(0);
  latestBlock$ = this.latestBlockSubject.asObservable();

  config = {
    apiKey: "rO-vFS4QN5qxsKmhgCT24qRXcKYs6Xl_",
    network:  Network.ETH_SEPOLIA ,
  };
  getBlockNumber(): Observable<number> {
    return from(this.alchemy.core.getBlockNumber());
  }
  alchemy = new Alchemy(this.config);
  constructor() { 
    // Subscription for new blocks on Eth Mainnet.
      this.alchemy.ws.on("block", (blockNumber) => {
        
          this.latestBlockSubject.next(blockNumber);
      }
    
    );


    this.alchemy.ws.on(
      {
        method: "alchemy_pendingTransactions",
        toAddress: "vitalik.eth",
      } as AlchemyEventType,
      (tx) => console.log(tx)
    );
  }



  async  logs() { // for contract
    const getLogs = await this.alchemy.core.getLogs({
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        ],
        blockHash:
          "0x49664d1de6b3915d7e6fa297ff4b3d1c5328b8ecf2ff0eefb912a4dc5f6ad4a0",
    });
    console.log(getLogs);
  }
}
