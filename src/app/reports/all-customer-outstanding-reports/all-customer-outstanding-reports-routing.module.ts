import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AllCustomerOutstandingReportsPage } from './all-customer-outstanding-reports.page';

const routes: Routes = [
  {
    path: '',
    component: AllCustomerOutstandingReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllCustomerOutstandingReportsPageRoutingModule {}
