import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReceivablesPageRoutingModule } from './receivables-routing.module';

import { ReceivablesPage } from './receivables.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        IonicModule,
        ReactiveFormsModule,
        ReceivablesPageRoutingModule,
    ],
    declarations: [ReceivablesPage],
})
export class ReceivablesPageModule {}
