import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VpurchaseAccountsStatementPage } from './vpurchase-accounts-statement.page';

const routes: Routes = [
  {
    path: '',
    component: VpurchaseAccountsStatementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VpurchaseAccountsStatementPageRoutingModule {}
