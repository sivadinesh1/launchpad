import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinancialsVendorPageRoutingModule } from './financials-vendor-routing.module';

import { FinancialsVendorPage } from './financials-vendor.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		SharedModule,
		ReactiveFormsModule,
		IonicModule,
		FinancialsVendorPageRoutingModule,
	],
	declarations: [FinancialsVendorPage],
})
export class FinancialsVendorPageModule {}
