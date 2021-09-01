import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchPurchasePage } from './search-purchase.page';

const routes: Routes = [
  {
    path: '',
    component: SearchPurchasePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchPurchasePageRoutingModule {}
