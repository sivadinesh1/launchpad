import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchaseOrderPageRoutingModule } from './purchase-order-routing.module';

import { PurchaseOrderPage } from './purchase-order.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        SharedModule,
        PurchaseOrderPageRoutingModule,
    ],
    declarations: [PurchaseOrderPage],
})
export class PurchaseOrderPageModule {}
