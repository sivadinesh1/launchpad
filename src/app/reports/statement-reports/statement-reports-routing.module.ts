import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StatementReportsPage } from './statement-reports.page';

const routes: Routes = [
  {
    path: '',
    component: StatementReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatementReportsPageRoutingModule {}
