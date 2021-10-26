import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesDataResolverService } from '../services/sales-data-resolver.service';

const routes: Routes = [
    {
        path: 'search-return-sales',
        loadChildren: () =>
            import(
                './return-sale/search-return-sales/search-return-sales.module'
            ).then((m) => m.SearchReturnSalesPageModule),
    },
    {
        path: 'sale-order',
        loadChildren: () =>
            import('./sale-order/sale-order.module').then(
                (m) => m.SaleOrderPageModule
            ),
    },
    {
        path: 'search-sale-order',
        loadChildren: () =>
            import('./search-sale-order/search-sale-order.module').then(
                (m) => m.SearchSaleOrderPageModule
            ),
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SalesPageRoutingModule {}
