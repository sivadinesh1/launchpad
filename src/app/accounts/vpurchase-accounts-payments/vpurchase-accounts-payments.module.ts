import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VpurchaseAccountsPaymentsPageRoutingModule } from './vpurchase-accounts-payments-routing.module';

import { VpurchaseAccountsPaymentsPage } from './vpurchase-accounts-payments.page';
import { SharedModule } from '../../shared.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		SharedModule,
		ReactiveFormsModule,
		VpurchaseAccountsPaymentsPageRoutingModule,
	],
	declarations: [VpurchaseAccountsPaymentsPage],
})
export class VpurchaseAccountsPaymentsPageModule {}
