import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryReportsPageRoutingModule } from './inventory-reports-routing.module';

import { InventoryReportsPage } from './inventory-reports.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    InventoryReportsPageRoutingModule
  ],
  declarations: [InventoryReportsPage]
})
export class InventoryReportsPageModule { }
