import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditCenterPageRoutingModule } from './edit-center-routing.module';

import { EditCenterPage } from './edit-center.page';
import { SharedModule } from '../../../shared.module';

@NgModule({
  imports: [

    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    EditCenterPageRoutingModule
  ],
  declarations: [EditCenterPage]
})
export class EditCenterPageModule { }
