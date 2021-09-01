import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchSalesPageRoutingModule } from './search-sales-routing.module';

import { SearchSalesPage } from './search-sales.page';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    SearchSalesPageRoutingModule
  ],
  declarations: [SearchSalesPage]
})
export class SearchSalesPageModule { }
