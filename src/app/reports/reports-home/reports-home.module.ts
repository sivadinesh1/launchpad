import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportsHomePageRoutingModule } from './reports-home-routing.module';

import { ReportsHomePage } from './reports-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportsHomePageRoutingModule
  ],
  declarations: [ReportsHomePage]
})
export class ReportsHomePageModule {}
