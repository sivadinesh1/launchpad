import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendorDataResolverService } from 'src/app/services/vendor-data-resolver.service';

import { FinancialsVendorPage } from './financials-vendor.page';

const routes: Routes = [
	{
		path: '',
		component: FinancialsVendorPage,
		resolve: { vendordata: VendorDataResolverService },
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class FinancialsVendorPageRoutingModule {}
