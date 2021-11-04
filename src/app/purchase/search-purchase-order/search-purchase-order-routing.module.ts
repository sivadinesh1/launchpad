import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchPurchaseOrderPage } from './search-purchase-order.page';

const routes: Routes = [
  {
    path: '',
    component: SearchPurchaseOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchPurchaseOrderPageRoutingModule {}
