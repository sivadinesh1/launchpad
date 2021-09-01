import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesPage } from './sales.page';
import { SalesDataResolverService } from '../services/sales-data-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: SalesPage,
    resolve: { rawsalesdata: SalesDataResolverService }
  },


  {
    path: 'search-return-sales',
    loadChildren: () => import('./return-sale/search-return-sales/search-return-sales.module').then(m => m.SearchReturnSalesPageModule)
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesPageRoutingModule { }

