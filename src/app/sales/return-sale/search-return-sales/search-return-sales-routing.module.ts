import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchReturnSalesPage } from './search-return-sales.page';

const routes: Routes = [
  {
    path: '',
    component: SearchReturnSalesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchReturnSalesPageRoutingModule {}
