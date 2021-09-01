import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchReturnSalesPageRoutingModule } from './search-return-sales-routing.module';

import { SearchReturnSalesPage } from './search-return-sales.page';
import { SharedModule } from '../../../shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    SearchReturnSalesPageRoutingModule
  ],
  declarations: [SearchReturnSalesPage]
})
export class SearchReturnSalesPageModule { }
