
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CommonApiService } from './common-api.service';
import { AuthenticationService } from './authentication.service';



@Injectable({
    providedIn: 'root',
})
export class PurchaseDataResolverService implements Resolve<any> {

    constructor(private commonapiservice: CommonApiService, private authenticationService: AuthenticationService) {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        const id = route.paramMap.get('purchaseid');

        if (id != null) {

            return this.commonapiservice.purchaseMasterData(route.paramMap.get('purchaseid'));
        }

    }



}
