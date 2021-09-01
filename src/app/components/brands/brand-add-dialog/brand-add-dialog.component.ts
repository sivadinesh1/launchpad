import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from '../../../services/common-api.service';
import { Validators, FormBuilder } from '@angular/forms';

import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-brand-add-dialog',
  templateUrl: './brand-add-dialog.component.html',
  styleUrls: ['./brand-add-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandAddDialogComponent implements OnInit {
  center_id: any;
  submitForm: any;
  errmsg: any;

  userdata$: Observable<User>;
  userdata: any;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<BrandAddDialogComponent>,
    private _route: ActivatedRoute,
    private _authservice: AuthenticationService,
    private _commonApiService: CommonApiService
  ) {
    // const currentUser = this._authservice.currentUserValue;
    // this.center_id = currentUser.center_id;

    this.submitForm = this._formBuilder.group({
      center_id: [],
      name: [null, Validators.required],
    });

    this.userdata$ = this._authservice.currentUser;
    this.userdata$
      .pipe(filter((data) => data !== null))
      .subscribe((data: any) => {
        this.userdata = data;

        this.submitForm.patchValue({
          center_id: data.center_id,
        });

        this._cdr.markForCheck();
      });

    if (this.userdata !== undefined) {
      this.submitForm.patchValue({
        center_id: this.userdata.center_id,
      });
    }
  }

  ngOnInit() {
    this.dialogRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    });

    this.dialogRef.backdropClick().subscribe((event) => {
      this.close();
    });
  }

  onSubmit() {
    this.errmsg = '';
    if (!this.submitForm.valid) {
      return false;
    }

    if (this.submitForm.value.name.length > 0) {
      this._commonApiService
        .isBrandExists(this.submitForm.value.name, this.userdata.center_id)
        .subscribe((data: any) => {
          if (data.result.length > 0) {
            if (data.result[0].id > 0) {
              this.errmsg = 'Brand already exists!';
            }
          } else {
            this._commonApiService
              .addBrand(this.submitForm.value)
              .subscribe((data: any) => {
                if (data.body.affectedRows === 1) {
                  this.dialogRef.close('success');
                }
              });
          }

          this._cdr.markForCheck();
        });
    }
  }

  searchBrands() {
    this._router.navigate([`/home/view-brands`]);
  }

  addBrand() {
    this._router.navigate([`/home/brand/add`]);
  }

  reset() {}

  close() {
    this.dialogRef.close();
  }
}
