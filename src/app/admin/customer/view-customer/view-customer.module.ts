import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewCustomerPageRoutingModule } from './view-customer-routing.module';

import { ViewCustomerPage } from './view-customer.page';
import { SharedModule } from '../../../shared.module';

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, SharedModule, ReactiveFormsModule, ViewCustomerPageRoutingModule],
	declarations: [ViewCustomerPage],
})
export class ViewCustomerPageModule {}
