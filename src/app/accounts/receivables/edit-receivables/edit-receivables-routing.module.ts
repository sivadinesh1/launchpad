import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditReceivablesDataResolverService } from 'src/app/services/edit-receivables-data-resolver.service';

import { EditReceivablesPage } from './edit-receivables.page';

const routes: Routes = [
    {
        path: '',
        component: EditReceivablesPage,
        resolve: { payments_data: EditReceivablesDataResolverService },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EditReceivablesPageRoutingModule {}
