import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinancialsCustomerPage } from './financials-customer.page';
import { CustomerDataResolverService } from 'src/app/services/customer-data-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: FinancialsCustomerPage,
    resolve: { customerdata: CustomerDataResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinancialsCustomerPageRoutingModule { }


