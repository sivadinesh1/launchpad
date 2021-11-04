import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchasePage } from './purchase.page';
import { PurchaseDataResolverService } from '../services/purchase-data-resolver.service';

const routes: Routes = [
    {
        path: '',
        component: PurchasePage,
        resolve: { rawpurchasedata: PurchaseDataResolverService },
    },
  {
    path: 'search-purchase-order',
    loadChildren: () => import('./search-purchase-order/search-purchase-order.module').then( m => m.SearchPurchaseOrderPageModule)
  },
    //   {
    //     path: 'purchase-order',
    //     loadChildren: () => import('./purchase-order/purchase-order.module').then( m => m.PurchaseOrderPageModule)
    //   },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PurchasePageRoutingModule {}
