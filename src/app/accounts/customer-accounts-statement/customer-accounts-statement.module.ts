import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerAccountsStatementPageRoutingModule } from './customer-accounts-statement-routing.module';

import { CustomerAccountsStatementPage } from './customer-accounts-statement.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
	imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, IonicModule, CustomerAccountsStatementPageRoutingModule],
	declarations: [CustomerAccountsStatementPage],
})
export class CustomerAccountsStatementPageModule {}
