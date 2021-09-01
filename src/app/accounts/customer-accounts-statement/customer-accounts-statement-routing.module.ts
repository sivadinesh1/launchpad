import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerAccountsStatementPage } from './customer-accounts-statement.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerAccountsStatementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerAccountsStatementPageRoutingModule {}
