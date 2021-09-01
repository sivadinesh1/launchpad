import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewProductsPageRoutingModule } from './view-products-routing.module';

import { ViewProductsPage } from './view-products.page';
import { SharedModule } from '../../../shared.module';

@NgModule({
  imports: [

    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    ViewProductsPageRoutingModule
  ],
  declarations: [ViewProductsPage]
})
export class ViewProductsPageModule { }
