import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { CommonApiService } from '../services/common-api.service';
import { filter, tap, debounceTime, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { User } from '../models/User';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
    user_data$: Observable<User>;
    user_data: any;

    constructor(
        private _authService: AuthenticationService,
        private _cdr: ChangeDetectorRef,
        private _commonApiService: CommonApiService,
        private _dialog: MatDialog,
        private _route: ActivatedRoute,
        private _router: Router
    ) {
        this.user_data$ = this._authService.currentUser;
        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this._authService.setCurrentMenu('HOME');
                this.user_data = data;
                this.reloadInquirySummary();
                this._cdr.markForCheck();
            });
    }

    ngOnInit() {}

    reloadInquirySummary() {
        this._commonApiService
            .fetchInquirySummary({
                center_id: this.user_data.center_id,
                from_date: moment().format('MM-DD-YYYY'),
                to_date: moment().format('MM-DD-YYYY'),
            })
            .subscribe((data: any) => {});

        this._cdr.markForCheck();
    }
}
