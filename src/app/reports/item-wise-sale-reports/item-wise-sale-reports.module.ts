import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemWiseSaleReportsPageRoutingModule } from './item-wise-sale-reports-routing.module';

import { ItemWiseSaleReportsPage } from './item-wise-sale-reports.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		SharedModule,
		ReactiveFormsModule,
		IonicModule,
		ItemWiseSaleReportsPageRoutingModule,
	],
	declarations: [ItemWiseSaleReportsPage],
})
export class ItemWiseSaleReportsPageModule {}
