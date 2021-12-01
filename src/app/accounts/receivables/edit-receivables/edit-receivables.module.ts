import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditReceivablesPageRoutingModule } from './edit-receivables-routing.module';

import { EditReceivablesPage } from './edit-receivables.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditReceivablesPageRoutingModule
  ],
  declarations: [EditReceivablesPage]
})
export class EditReceivablesPageModule {}
