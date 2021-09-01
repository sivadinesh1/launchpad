import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { Brand } from 'src/app/models/Brand';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrandEditDialogComponent } from '../brands/brand-edit-dialog/brand-edit-dialog.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoadingService } from '../loading/loading.service';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
  selector: 'app-delete-brand-dialog',
  templateUrl: './delete-brand-dialog.component.html',
  styleUrls: ['./delete-brand-dialog.component.scss'],
})
export class DeleteBrandDialogComponent implements OnInit {
  center_id: any;
  submitForm: any;
  brand: Brand;

  constructor(private _cdr: ChangeDetectorRef, private _router: Router,
    @Inject(MAT_DIALOG_DATA) brand: Brand,
    private dialogRef: MatDialogRef<BrandEditDialogComponent>,
    private _route: ActivatedRoute, private _authservice: AuthenticationService,

    private _commonApiService: CommonApiService) {
    const currentUser = this._authservice.currentUserValue;
    this.center_id = currentUser.center_id;

    this.brand = brand;

  }

  ngOnInit() { }

  delete() {
    this._commonApiService.deleteBrand(this.brand.id).subscribe((data: any) => {
      console.log('object.. brand deleted ..')
      this.dialogRef.close('success');
    });
  }

  cancel() {
    this.dialogRef.close();
  }

}

