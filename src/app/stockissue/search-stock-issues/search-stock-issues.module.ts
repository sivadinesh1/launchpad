import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchStockIssuesPageRoutingModule } from './search-stock-issues-routing.module';

import { SearchStockIssuesPage } from './search-stock-issues.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
	imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, IonicModule, SearchStockIssuesPageRoutingModule],
	declarations: [SearchStockIssuesPage],
})
export class SearchStockIssuesPageModule {}
