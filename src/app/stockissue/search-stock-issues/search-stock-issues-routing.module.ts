import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchStockIssuesPage } from './search-stock-issues.page';

const routes: Routes = [
  {
    path: '',
    component: SearchStockIssuesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchStockIssuesPageRoutingModule {}
