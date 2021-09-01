import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewCustomerPage } from './view-customer.page';

const routes: Routes = [
  {
    path: '',
    component: ViewCustomerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewCustomerPageRoutingModule {}
