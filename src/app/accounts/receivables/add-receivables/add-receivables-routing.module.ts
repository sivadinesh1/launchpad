import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddReceivablesPage } from './add-receivables.page';

const routes: Routes = [
  {
    path: '',
    component: AddReceivablesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddReceivablesPageRoutingModule {}
