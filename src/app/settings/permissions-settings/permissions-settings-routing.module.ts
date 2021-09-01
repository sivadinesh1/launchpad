import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionsSettingsPage } from './permissions-settings.page';

const routes: Routes = [
  {
    path: '',
    component: PermissionsSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermissionsSettingsPageRoutingModule {}
