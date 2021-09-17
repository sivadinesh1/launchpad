import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchSaleOrderPageRoutingModule } from './search-sale-order-routing.module';

import { SearchSaleOrderPage } from './search-sale-order.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    SearchSaleOrderPageRoutingModule,
  ],
  declarations: [SearchSaleOrderPage],
})
export class SearchSaleOrderPageModule {}
