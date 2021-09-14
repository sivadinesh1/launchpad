import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SaleOrderPageRoutingModule } from './sale-order-routing.module';

import { SaleOrderPage } from './sale-order.page';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    SaleOrderPageRoutingModule,
  ],
  declarations: [SaleOrderPage],
})
export class SaleOrderPageModule {}
