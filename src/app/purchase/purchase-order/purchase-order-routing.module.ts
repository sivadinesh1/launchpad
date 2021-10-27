import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DirtyCheckGuard } from 'src/app/services/dirty-check.guard';
import { PurchaseDataResolverService } from 'src/app/services/purchase-data-resolver.service';

import { PurchaseOrderPage } from './purchase-order.page';

// const routes: Routes = [
//   {
//     path: '',
//     component: PurchaseOrderPage
//   }
// ];

const routes: Routes = [
    {
        path: '',
        component: PurchaseOrderPage,
        canDeactivate: [DirtyCheckGuard],
        resolve: { rawPurchasedData: PurchaseDataResolverService },
    },
    // {
    //   path: 'purchase-order',
    //   loadChildren: () => import('./purchase-order/purchase-order.module').then( m => m.PurchaseOrderPageModule)
    // },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PurchaseOrderPageRoutingModule {}
