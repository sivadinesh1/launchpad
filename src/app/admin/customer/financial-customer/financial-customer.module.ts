import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinancialCustomerPageRoutingModule } from './financial-customer-routing.module';

import { FinancialCustomerPage } from './financial-customer.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        ReactiveFormsModule,
        IonicModule,
        FinancialCustomerPageRoutingModule,
    ],
    declarations: [FinancialCustomerPage],
})
export class FinancialCustomerPageModule {}
