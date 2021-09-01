import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountsPaymentsPageRoutingModule } from './accounts-payments-routing.module';

import { AccountsPaymentsPage } from './accounts-payments.page';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [

    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    AccountsPaymentsPageRoutingModule
  ],
  declarations: [AccountsPaymentsPage]
})
export class AccountsPaymentsPageModule { }
