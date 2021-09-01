import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewBrandsPage } from './view-brands.page';

const routes: Routes = [
  {
    path: '',
    component: ViewBrandsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewBrandsPageRoutingModule {}
