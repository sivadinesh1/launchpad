import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatementReportsPageRoutingModule } from './statement-reports-routing.module';

import { StatementReportsPage } from './statement-reports.page';
import { SharedModule } from 'src/app/shared.module';
@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		SharedModule,
		ReactiveFormsModule,
		StatementReportsPageRoutingModule,
	],
	declarations: [StatementReportsPage],
})
export class StatementReportsPageModule {}
