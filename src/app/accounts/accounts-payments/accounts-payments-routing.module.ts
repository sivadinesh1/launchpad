import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountsPaymentsPage } from './accounts-payments.page';

const routes: Routes = [
  {
    path: '',
    component: AccountsPaymentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsPaymentsPageRoutingModule {}
