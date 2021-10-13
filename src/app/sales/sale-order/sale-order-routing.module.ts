import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DirtyCheckGuard } from 'src/app/services/dirty-check.guard';
import { SalesDataResolverService } from 'src/app/services/sales-data-resolver.service';

import { SaleOrderPage } from './sale-order.page';

const routes: Routes = [
    {
        path: '',
        component: SaleOrderPage,
        canDeactivate: [DirtyCheckGuard],
        resolve: { rawsalesdata: SalesDataResolverService },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SaleOrderPageRoutingModule {}
