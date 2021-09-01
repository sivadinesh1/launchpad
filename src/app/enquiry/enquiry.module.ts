import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnquiryPageRoutingModule } from './enquiry-routing.module';

import { EnquiryPage } from './enquiry.page';
import { SharedModule } from '../shared.module';


@NgModule({
  imports: [


    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule,
    EnquiryPageRoutingModule
  ],
  declarations: [EnquiryPage]
})
export class EnquiryPageModule { }
