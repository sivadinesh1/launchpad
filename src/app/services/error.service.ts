import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorObject } from '../util/errorobject';
import * as myGlobals from '../services/globals';
import { SubSink } from 'subsink';
import { CommonApiService } from './common-api.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
    providedIn: 'root',
})
export class ErrorService implements OnInit, OnDestroy {
    appErrorObj: any;
    errorObj: any;

    center_id: any;
    userid: any;

    private unsubscribe$ = new SubSink();

    constructor(
        private _http: HttpClient,
        private _authService: AuthenticationService,
        private _commonapiservice: CommonApiService
    ) {}

    ngOnInit() {
        const currentUser = this._authService.currentUserValue;
        this.center_id = currentUser.center_id;
        this.userid = currentUser.userid;
    }

    logErrortoService(params, err) {
        this.errorObj = new ErrorObject(
            myGlobals.appid,
            this.center_id,
            this.userid,
            params,
            err,
            this._authService.device
        );

        this.unsubscribe$.sink = this._commonapiservice
            .captureError(this.errorObj)
            .subscribe((data) => {
                console.log('object' + JSON.stringify(data));
            });
    }

    ngOnDestroy() {
        this.unsubscribe$.unsubscribe();
    }
}
