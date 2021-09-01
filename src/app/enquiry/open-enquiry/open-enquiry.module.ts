import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OpenEnquiryPageRoutingModule } from './open-enquiry-routing.module';

import { OpenEnquiryPage } from './open-enquiry.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [


    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule,
    OpenEnquiryPageRoutingModule
  ],
  declarations: [OpenEnquiryPage]
})
export class OpenEnquiryPageModule { }
