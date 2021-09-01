import { Injectable } from '@angular/core';
import {
	Resolve,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
import { CommonApiService } from './common-api.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
	providedIn: 'root',
})
export class VendorDataResolverService implements Resolve<any> {
	constructor(
		private commonapiservice: CommonApiService,
		private authenticationService: AuthenticationService
	) {}

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const center_id = route.paramMap.get('center_id');
		const vendor_id = route.paramMap.get('vendor_id');
		return this.commonapiservice.getVendorDetails(center_id, vendor_id);
	}
}
