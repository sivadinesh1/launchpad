import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductSummaryReportsPage } from './product-summary-reports.page';

const routes: Routes = [
  {
    path: '',
    component: ProductSummaryReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductSummaryReportsPageRoutingModule { }
