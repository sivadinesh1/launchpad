import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewBrandsPageRoutingModule } from './view-brands-routing.module';

import { ViewBrandsPage } from './view-brands.page';
import { SharedModule } from '../../../shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    ViewBrandsPageRoutingModule
  ],
  declarations: [ViewBrandsPage]
})
export class ViewBrandsPageModule { }
