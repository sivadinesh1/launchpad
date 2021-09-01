import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditPurchasePage } from './edit-purchase.page';

const routes: Routes = [
  {
    path: '',
    component: EditPurchasePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditPurchasePageRoutingModule {}
