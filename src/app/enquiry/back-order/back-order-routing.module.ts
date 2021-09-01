import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BackOrderPage } from './back-order.page';

const routes: Routes = [
  {
    path: '',
    component: BackOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BackOrderPageRoutingModule {}
