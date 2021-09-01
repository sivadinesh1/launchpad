import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewDiscountsPageRoutingModule } from './view-discounts-routing.module';

import { ViewDiscountsPage } from './view-discounts.page';
import { SharedModule } from 'src/app/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    ViewDiscountsPageRoutingModule
  ],
  declarations: [ViewDiscountsPage]
})
export class ViewDiscountsPageModule { }
