import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VpurchaseAccountsStatementPageRoutingModule } from './vpurchase-accounts-statement-routing.module';

import { VpurchaseAccountsStatementPage } from './vpurchase-accounts-statement.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
	imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, IonicModule, VpurchaseAccountsStatementPageRoutingModule],
	declarations: [VpurchaseAccountsStatementPage],
})
export class VpurchaseAccountsStatementPageModule {}
