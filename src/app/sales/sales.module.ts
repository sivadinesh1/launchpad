import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesPageRoutingModule } from './sales-routing.module';

import { SalesPage } from './sales.page';
import { SharedModule } from '../shared.module';
import { SearchSaleOrderPipe } from './search-sale-order.pipe';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    SalesPageRoutingModule
  ],
  declarations: [SalesPage, SearchSaleOrderPipe]
})
export class SalesPageModule { }

