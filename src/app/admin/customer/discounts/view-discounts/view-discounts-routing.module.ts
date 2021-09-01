import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewDiscountsPage } from './view-discounts.page';

const routes: Routes = [
  {
    path: '',
    component: ViewDiscountsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewDiscountsPageRoutingModule {}
