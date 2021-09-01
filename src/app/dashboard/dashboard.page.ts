import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage implements OnInit {
  userdata$: Observable<User>;
  userdata: any;

  constructor(private _authservice: AuthenticationService, private _cdr: ChangeDetectorRef,
    private _commonApiService: CommonApiService, private _dialog: MatDialog,
    private _route: ActivatedRoute,
    private _router: Router,) {

    this.userdata$ = this._authservice.currentUser;
    this.userdata$
      .pipe(
        filter((data) => data !== null))
      .subscribe((data: any) => {
        this._authservice.setCurrentMenu("HOME");
        this.userdata = data;
        this.reloadInquirySummary();
        this._cdr.markForCheck();
      });

  }

  ngOnInit() {
  }

  reloadInquirySummary() {

    this._commonApiService.fetchInquirySummary(
      { "center_id": this.userdata.center_id, "from_date": moment().format('MM-DD-YYYY'), "to_date": moment().format('MM-DD-YYYY') })
      .subscribe((data: any) => {



      });

    this._cdr.markForCheck();
  }

}
