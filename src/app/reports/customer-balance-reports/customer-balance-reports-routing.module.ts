import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerBalanceReportsResolverService } from 'src/app/services/customer-balances-reports-resolver.service';

import { CustomerBalanceReportsPage } from './customer-balance-reports.page';

const routes: Routes = [
    {
        path: '',
        component: CustomerBalanceReportsPage,
        resolve: {
            customer_balance_data: CustomerBalanceReportsResolverService,
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CustomerBalanceReportsPageRoutingModule {}
