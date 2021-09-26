import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { CommonApiService } from './common-api.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerDataResolverService implements Resolve<any> {
  constructor(
    private commonapiservice: CommonApiService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const value = this.router.getCurrentNavigation().extras.state;

    let customer_id = value?.customer_id;
    if(customer_id === undefined) {
      customer_id = history.state.customer_id;
    }



    return this.commonapiservice.getCustomerDetails(customer_id);
  }
}
