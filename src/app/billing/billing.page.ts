

import { Subscription } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Route, ActivatedRoute, Router } from '@angular/router';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.page.html',
  styleUrls: ['./billing.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingPage implements OnInit {
  paramsSubscription: Subscription;
  enquiryid: any;
  enquirydata: any;
  partydata: any;

  constructor(private _route: ActivatedRoute, private _cdr: ChangeDetectorRef,
    private _router: Router,
    private _commonApiService: CommonApiService) { }

  ngOnInit() {
    this.paramsSubscription = this._route.params.subscribe(params => {
      this.enquiryid = params['enquiryid'];
      console.log('object....>>.');

      // this._commonApiService.getPartyDetails(this.enquiryid).subscribe(e => {
      //   this.partydata = e[0];

      //   this._cdr.markForCheck();
      // });


      // this._commonApiService.getDetailsByEnquiryId(this.enquiryid).subscribe(data => {
      //   this.enquirydata = data;
      //   console.log('object.....' + JSON.stringify(this.enquirydata));
      //   this._cdr.markForCheck();
      // });

      this._cdr.markForCheck();


    });
  }

  pay(id) {
    this._router.navigateByUrl(`/paymentgateway/${id}`);
  }
}

