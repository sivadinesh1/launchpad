import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinancialCustomerPage } from './financial-customer.page';
import { CustomerDataResolverService } from 'src/app/services/customer-data-resolver.service';

const routes: Routes = [
    {
        path: '',
        component: FinancialCustomerPage,
        resolve: { customer_data: CustomerDataResolverService },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FinancialCustomerPageRoutingModule {}
