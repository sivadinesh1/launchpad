import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditPurchasePageRoutingModule } from './edit-purchase-routing.module';

import { EditPurchasePage } from './edit-purchase.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditPurchasePageRoutingModule
  ],
  declarations: [EditPurchasePage]
})
export class EditPurchasePageModule {}
