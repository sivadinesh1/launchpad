import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DirtyCheckGuard } from 'src/app/services/dirtycheck.guard';

import { SaleOrderPage } from './sale-order.page';

const routes: Routes = [
  {
    path: '',
    component: SaleOrderPage,
    canDeactivate: [DirtyCheckGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SaleOrderPageRoutingModule {}
