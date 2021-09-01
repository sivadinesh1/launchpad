import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportsHomePage } from './reports-home.page';

const routes: Routes = [
  {
    path: '',
    component: ReportsHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsHomePageRoutingModule {}
