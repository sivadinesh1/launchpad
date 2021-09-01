import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LedgerCustomerPageRoutingModule } from './ledger-customer-routing.module';

import { LedgerCustomerPage } from './ledger-customer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LedgerCustomerPageRoutingModule
  ],
  declarations: [LedgerCustomerPage]
})
export class LedgerCustomerPageModule {}
