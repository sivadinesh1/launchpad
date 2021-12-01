import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddReceivablesPageRoutingModule } from './add-receivables-routing.module';

import { AddReceivablesPage } from './add-receivables.page';

import { SharedModule } from 'src/app/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SharedModule,
        ReactiveFormsModule,
        AddReceivablesPageRoutingModule,
    ],
    declarations: [AddReceivablesPage],
})
export class AddReceivablesPageModule {}
