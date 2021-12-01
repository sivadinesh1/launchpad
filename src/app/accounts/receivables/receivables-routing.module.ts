import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReceivablesDataResolverService } from 'src/app/services/receivables-data-resolver.service';

import { ReceivablesPage } from './receivables.page';

const routes: Routes = [
  {
    path: '',
    component: ReceivablesPage,
    resolve: { payments_received_data: ReceivablesDataResolverService },
  },
  {
    path: 'edit-receivables',
    loadChildren: () => import('./edit-receivables/edit-receivables.module').then( m => m.EditReceivablesPageModule)
  },
  {
    path: 'add-receivables',
    loadChildren: () => import('./add-receivables/add-receivables.module').then( m => m.AddReceivablesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReceivablesPageRoutingModule {}
