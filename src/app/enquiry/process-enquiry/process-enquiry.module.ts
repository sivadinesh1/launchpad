import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProcessEnquiryPageRoutingModule } from './process-enquiry-routing.module';

import { ProcessEnquiryPage } from './process-enquiry.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [

    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule,
    ProcessEnquiryPageRoutingModule
  ],
  declarations: [ProcessEnquiryPage]
})
export class ProcessEnquiryPageModule { }
