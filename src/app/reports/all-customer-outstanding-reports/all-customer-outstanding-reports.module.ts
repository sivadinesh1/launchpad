import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AllCustomerOutstandingReportsPageRoutingModule } from './all-customer-outstanding-reports-routing.module';

import { AllCustomerOutstandingReportsPage } from './all-customer-outstanding-reports.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
	imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, IonicModule, AllCustomerOutstandingReportsPageRoutingModule],
	declarations: [AllCustomerOutstandingReportsPage],
})
export class AllCustomerOutstandingReportsPageModule {}
