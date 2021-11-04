import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPurchaseOrderPageRoutingModule } from './search-purchase-order-routing.module';

import { SearchPurchaseOrderPage } from './search-purchase-order.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        IonicModule,
        SearchPurchaseOrderPageRoutingModule,
    ],
    declarations: [SearchPurchaseOrderPage],
})
export class SearchPurchaseOrderPageModule {}
