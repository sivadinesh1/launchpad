import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerBalanceReportsPageRoutingModule } from './customer-balance-reports-routing.module';

import { CustomerBalanceReportsPage } from './customer-balance-reports.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SharedModule,
        ReactiveFormsModule,
        CustomerBalanceReportsPageRoutingModule,
    ],
    declarations: [CustomerBalanceReportsPage],
})
export class CustomerBalanceReportsPageModule {}
