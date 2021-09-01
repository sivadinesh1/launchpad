import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LedgerCustomerPage } from './ledger-customer.page';

const routes: Routes = [
  {
    path: '',
    component: LedgerCustomerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LedgerCustomerPageRoutingModule {}
