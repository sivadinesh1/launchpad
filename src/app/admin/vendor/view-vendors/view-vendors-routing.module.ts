import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewVendorsPage } from './view-vendors.page';

const routes: Routes = [
  {
    path: '',
    component: ViewVendorsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewVendorsPageRoutingModule {}
