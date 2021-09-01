import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { Enquiry } from 'src/app/models/Enquiry';
import { Router, ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteVendorDialogComponent } from '../delete-vendor-dialog/delete-vendor-dialog.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
  selector: 'app-delete-enquiry-dialog',
  templateUrl: './delete-enquiry-dialog.component.html',
  styleUrls: ['./delete-enquiry-dialog.component.scss'],
})
export class DeleteEnquiryDialogComponent implements OnInit {

  center_id: any;
  submitForm: any;
  enquiry: Enquiry;

  constructor(private _cdr: ChangeDetectorRef, private _router: Router,
    @Inject(MAT_DIALOG_DATA) enquiry: Enquiry,
    private dialogRef: MatDialogRef<DeleteVendorDialogComponent>,
    private _route: ActivatedRoute, private _authservice: AuthenticationService,

    private _commonApiService: CommonApiService) {
    const currentUser = this._authservice.currentUserValue;
    this.center_id = currentUser.center_id;

    this.enquiry = enquiry;

  }

  ngOnInit() { }

  delete() {
    this._commonApiService.deleteEnquiry(this.enquiry.id).subscribe((data: any) => {
      console.log('object.. enquiry deleted ..')
      this.dialogRef.close('success');
    });
  }

  cancel() {
    this.dialogRef.close();
  }


}


