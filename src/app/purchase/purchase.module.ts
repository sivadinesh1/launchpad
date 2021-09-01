import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchasePageRoutingModule } from './purchase-routing.module';

import { PurchasePage } from './purchase.page';
import { SharedModule } from '../shared.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		SharedModule,

		ReactiveFormsModule,
		PurchasePageRoutingModule,
	],

	declarations: [PurchasePage],
})
export class PurchasePageModule {}
