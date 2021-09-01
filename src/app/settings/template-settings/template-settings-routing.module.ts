import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TemplateSettingsPage } from './template-settings.page';

const routes: Routes = [
  {
    path: '',
    component: TemplateSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TemplateSettingsPageRoutingModule {}
