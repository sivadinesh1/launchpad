import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PermissionsSettingsPageRoutingModule } from './permissions-settings-routing.module';

import { PermissionsSettingsPage } from './permissions-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PermissionsSettingsPageRoutingModule
  ],
  declarations: [PermissionsSettingsPage]
})
export class PermissionsSettingsPageModule {}
