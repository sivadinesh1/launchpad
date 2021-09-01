import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VpurchaseAccountsPaymentsPage } from './vpurchase-accounts-payments.page';

const routes: Routes = [
  {
    path: '',
    component: VpurchaseAccountsPaymentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VpurchaseAccountsPaymentsPageRoutingModule {}
