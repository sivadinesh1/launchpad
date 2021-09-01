import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProcessEnquiryPage } from './process-enquiry.page';

const routes: Routes = [
  {
    path: '',
    component: ProcessEnquiryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcessEnquiryPageRoutingModule {}
