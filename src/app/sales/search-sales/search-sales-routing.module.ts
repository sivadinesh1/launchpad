import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchSalesPage } from './search-sales.page';

const routes: Routes = [
  {
    path: '',
    component: SearchSalesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchSalesPageRoutingModule { }


