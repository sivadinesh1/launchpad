import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { BankSettingsPageRoutingModule } from './bank-settings-routing.module'

import { BankSettingsPage } from './bank-settings.page'
import { SharedModule } from '../../shared.module'

@NgModule({
	imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, IonicModule, BankSettingsPageRoutingModule],
	declarations: [BankSettingsPage],
})
export class BankSettingsPageModule {}
