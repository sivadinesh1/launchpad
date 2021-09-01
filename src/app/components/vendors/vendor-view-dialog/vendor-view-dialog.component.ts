import { Component, OnInit, ChangeDetectorRef, ViewChild, Inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from '../../../services/common-api.service';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { patternValidator } from 'src/app/util/validators/pattern-validator';
import { GSTN_REGEX, country, PINCODE_REGEX, EMAIL_REGEX } from 'src/app/util/helper/patterns';
import { PhoneValidator } from 'src/app/util/validators/phone.validator';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { LoadingService } from '../../loading/loading.service';
import { Vendor } from 'src/app/models/Vendor';

@Component({
  selector: 'app-vendor-view-dialog',
  templateUrl: './vendor-view-dialog.component.html',
  styleUrls: ['./vendor-view-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    LoadingService
  ],
})
export class VendorViewDialogComponent implements OnInit {

  center_id: any;
  vendor_id: any;
  resultList: any;
  submitForm: any;

  isLinear = true;
  vendor: Vendor;
  statesdata

  constructor(private _cdr: ChangeDetectorRef, private _router: Router,
    private _formBuilder: FormBuilder, private dialogRef: MatDialogRef<VendorViewDialogComponent>,
    private _route: ActivatedRoute, private _authservice: AuthenticationService,
    private _loadingService: LoadingService, @Inject(MAT_DIALOG_DATA) vendor: Vendor,
    private _commonApiService: CommonApiService) {
    const currentUser = this._authservice.currentUserValue;
    this.center_id = currentUser.center_id;

    this.vendor = vendor;

    this.submitForm = this._formBuilder.group({

      vendor_id: [this.vendor.id],
      center_id: [this.center_id],
      name: [this.vendor.name, Validators.required],
      address1: [this.vendor.address1],
      address2: [this.vendor.address2],
      address3: [this.vendor.address3],

      district: [this.vendor.district],
      state_id: [this.vendor.state_id, Validators.required],
      pin: [this.vendor.pin, [patternValidator(PINCODE_REGEX)]],

      gst: [this.vendor.gst, [patternValidator(GSTN_REGEX)]],
      phone: [this.vendor.phone, Validators.compose([
        PhoneValidator.invalidCountryPhone(country)
      ])],
      mobile: [this.vendor.mobile, Validators.compose([
        Validators.required, PhoneValidator.invalidCountryPhone(country)
      ])],
      mobile2: [this.vendor.mobile2, Validators.compose([
        PhoneValidator.invalidCountryPhone(country)
      ])],
      whatsapp: [this.vendor.whatsapp, Validators.compose([
        Validators.required, PhoneValidator.invalidCountryPhone(country)
      ])],

      email: [this.vendor.email, [patternValidator(EMAIL_REGEX)]],

    });

    this._commonApiService.getStates().subscribe((data: any) => {
      this.statesdata = data;
    });

  }

  ngOnInit() {


  }





  searchVendorss() {

    this._router.navigate([`/home/view-vendors`]);
  }

  addVendor() {
    this._router.navigate([`/home/vendor/add`]);
  }

  close() {
    this.dialogRef.close();
  }

  reset() {

  }

}
