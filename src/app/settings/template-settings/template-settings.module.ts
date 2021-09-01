import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TemplateSettingsPageRoutingModule } from './template-settings-routing.module';

import { TemplateSettingsPage } from './template-settings.page';
import { SharedModule } from '../../shared.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		SharedModule,

		TemplateSettingsPageRoutingModule,
	],
	declarations: [TemplateSettingsPage],
})
export class TemplateSettingsPageModule {}
