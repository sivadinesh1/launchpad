import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductSummaryReportsPageRoutingModule } from './product-summary-reports-routing.module';

import { ProductSummaryReportsPage } from './product-summary-reports.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    IonicModule,
    ProductSummaryReportsPageRoutingModule
  ],
  declarations: [ProductSummaryReportsPage]
})
export class ProductSummaryReportsPageModule { }
