import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PendingReceivablesPageRoutingModule } from './pending-receivables-routing.module';

import { PendingReceivablesPage } from './pending-receivables.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        IonicModule,
        ReactiveFormsModule,
        PendingReceivablesPageRoutingModule,
    ],
    declarations: [PendingReceivablesPage],
})
export class PendingReceivablesPageModule {}
