import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BackOrderPageRoutingModule } from './back-order-routing.module';

import { BackOrderPage } from './back-order.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BackOrderPageRoutingModule
  ],
  declarations: [BackOrderPage]
})
export class BackOrderPageModule {}
