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
export class PurchaseDataResolverService implements Resolve<any> {
    constructor(
        private _commonApiService: CommonApiService,
        private authenticationService: AuthenticationService
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const id = route.paramMap.get('purchase-id');

        if (id != null) {
            return this._commonApiService.purchaseMasterData(
                route.paramMap.get('purchase-id')
            );
        }
    }
}
