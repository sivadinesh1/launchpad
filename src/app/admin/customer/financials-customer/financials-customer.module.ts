import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinancialsCustomerPageRoutingModule } from './financials-customer-routing.module';

import { FinancialsCustomerPage } from './financials-customer.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    IonicModule,
    FinancialsCustomerPageRoutingModule
  ],
  declarations: [FinancialsCustomerPage]
})
export class FinancialsCustomerPageModule { }
