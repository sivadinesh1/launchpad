import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryReportsPage } from './inventory-reports.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryReportsPageRoutingModule {}
