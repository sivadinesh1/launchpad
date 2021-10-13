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
import { plainToClass } from 'class-transformer';
import { Product } from 'src/app/models/Product';
import { Brand } from 'src/app/models/Brand';

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

    user_data$: Observable<User>;
    user_data: any;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<BrandAddDialogComponent>,
        private _route: ActivatedRoute,
        private _authService: AuthenticationService,
        private _commonApiService: CommonApiService
    ) {
        // const currentUser = this._authService.currentUserValue;
        // this.center_id = currentUser.center_id;

        this.submitForm = this._formBuilder.group({
            center_id: [],
            brand_name: [null, Validators.required],
        });

        this.user_data$ = this._authService.currentUser;
        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.user_data = data;

                this.submitForm.patchValue({
                    center_id: data.center_id,
                });

                this._cdr.markForCheck();
            });

        if (this.user_data !== undefined) {
            this.submitForm.patchValue({
                center_id: this.user_data.center_id,
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

        if (this.submitForm.value.brand_name.length > 0) {
            this._commonApiService
                .isBrandExists(this.submitForm.value.brand_name)
                .subscribe((data: any) => {
                    if (data.result.length > 0) {
                        if (data.result[0].id > 0) {
                            this.errmsg = 'Brand already exists!';
                        }
                    } else {
                        const brand = plainToClass(
                            Brand,
                            this.submitForm.value
                        );

                        this._commonApiService
                            .addBrand(brand)
                            .subscribe((data: any) => {
                                if (data.status === 200) {
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
