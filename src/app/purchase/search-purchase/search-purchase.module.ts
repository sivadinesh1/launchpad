import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPurchasePageRoutingModule } from './search-purchase-routing.module';

import { SearchPurchasePage } from './search-purchase.page';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [

    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    SearchPurchasePageRoutingModule
  ],
  declarations: [SearchPurchasePage]
})
export class SearchPurchasePageModule { }
