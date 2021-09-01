import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemWiseSaleReportsPage } from './item-wise-sale-reports.page';

const routes: Routes = [
  {
    path: '',
    component: ItemWiseSaleReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemWiseSaleReportsPageRoutingModule {}
