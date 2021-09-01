import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AuthenticationService } from 'src/app/services/authentication.service';

import { CommonApiService } from 'src/app/services/common-api.service';
import { Vendor } from 'src/app/models/Vendor';


@Component({
  selector: 'app-delete-vendor-dialog',
  templateUrl: './delete-vendor-dialog.component.html',
  styleUrls: ['./delete-vendor-dialog.component.scss'],
})
export class DeleteVendorDialogComponent implements OnInit {
  center_id: any;
  submitForm: any;
  vendor: Vendor;

  constructor(private _cdr: ChangeDetectorRef, private _router: Router,
    @Inject(MAT_DIALOG_DATA) vendor: Vendor,
    private dialogRef: MatDialogRef<DeleteVendorDialogComponent>,
    private _route: ActivatedRoute, private _authservice: AuthenticationService,

    private _commonApiService: CommonApiService) {
    const currentUser = this._authservice.currentUserValue;
    this.center_id = currentUser.center_id;

    this.vendor = vendor;

  }

  ngOnInit() { }

  delete() {
    this._commonApiService.deleteVendor(this.vendor.id).subscribe((data: any) => {
      console.log('object.. vendor deleted ..')
      this.dialogRef.close('success');
    });
  }

  cancel() {
    this.dialogRef.close();
  }

}

