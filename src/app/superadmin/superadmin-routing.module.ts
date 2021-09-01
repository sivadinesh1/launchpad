import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuperadminPage } from './superadmin.page';

const routes: Routes = [
  {
    path: '',
    component: SuperadminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuperadminPageRoutingModule {}
