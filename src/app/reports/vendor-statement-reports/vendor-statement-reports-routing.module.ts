import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VendorStatementReportsPage } from './vendor-statement-reports.page';

const routes: Routes = [
  {
    path: '',
    component: VendorStatementReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendorStatementReportsPageRoutingModule {}
