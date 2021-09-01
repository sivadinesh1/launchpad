import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenEnquiryPage } from './open-enquiry.page';

const routes: Routes = [
  {
    path: '',
    component: OpenEnquiryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpenEnquiryPageRoutingModule {}
