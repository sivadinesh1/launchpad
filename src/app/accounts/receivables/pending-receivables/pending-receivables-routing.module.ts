import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PendingReceivablesResolverService } from 'src/app/services/pending-receivables-resolver.service';

import { PendingReceivablesPage } from './pending-receivables.page';

const routes: Routes = [
    {
        path: '',
        component: PendingReceivablesPage,
        resolve: {
            pending_receivables_data: PendingReceivablesResolverService,
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PendingReceivablesPageRoutingModule {}
