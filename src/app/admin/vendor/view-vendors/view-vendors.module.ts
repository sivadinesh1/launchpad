import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewVendorsPageRoutingModule } from './view-vendors-routing.module';

import { ViewVendorsPage } from './view-vendors.page';
import { SharedModule } from '../../../shared.module';

@NgModule({
  imports: [

    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    ViewVendorsPageRoutingModule
  ],
  declarations: [ViewVendorsPage]
})
export class ViewVendorsPageModule { }
