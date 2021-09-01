import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnquiryPage } from './enquiry.page';

const routes: Routes = [
  {
    path: '',
    component: EnquiryPage
  },
  {
    path: 'back-order',
    loadChildren: () => import('./back-order/back-order.module').then( m => m.BackOrderPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnquiryPageRoutingModule { }
