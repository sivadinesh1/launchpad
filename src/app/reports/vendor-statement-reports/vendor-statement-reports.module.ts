import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VendorStatementReportsPageRoutingModule } from './vendor-statement-reports-routing.module';

import { VendorStatementReportsPage } from './vendor-statement-reports.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		SharedModule,
		ReactiveFormsModule,
		IonicModule,
		VendorStatementReportsPageRoutingModule,
	],
	declarations: [VendorStatementReportsPage],
})
export class VendorStatementReportsPageModule {}
