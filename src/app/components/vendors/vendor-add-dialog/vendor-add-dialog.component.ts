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
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { patternValidator } from 'src/app/util/validators/pattern-validator';

import {
    GST_N_REGEX,
    PIN_CODE_REGEX,
    EMAIL_REGEX,
} from '../../../util/helper/patterns';
import { country } from '../../../util/helper/patterns';
import { PhoneValidator } from 'src/app/util/validators/phone.validator';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User';

@Component({
    selector: 'app-vendor-add-dialog',
    templateUrl: './vendor-add-dialog.component.html',
    styleUrls: ['./vendor-add-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorAddDialogComponent implements OnInit {
    center_id: any;
    vendor_id: any;
    resultList: any;
    submitForm: any;

    states_data: any;
    isLinear = true;

    vExists: any;

    user_data$: Observable<User>;
    user_data: any;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<VendorAddDialogComponent>,
        private _route: ActivatedRoute,
        private _authService: AuthenticationService,
        private _commonApiService: CommonApiService
    ) {
        this.submitForm = this._formBuilder.group({
            center_id: [''],
            vendor_name: ['', Validators.required],
            address1: [''],
            address2: [''],
            address3: [''],

            district: [''],
            state_id: ['', Validators.required],
            pin: ['', [patternValidator(PIN_CODE_REGEX)]],

            gst: ['', [patternValidator(GST_N_REGEX)]],
            phone: [
                '',
                Validators.compose([
                    Validators.required,
                    PhoneValidator.invalidCountryPhone(country),
                ]),
            ],
            mobile: [
                '',
                Validators.compose([
                    Validators.required,
                    PhoneValidator.invalidCountryPhone(country),
                ]),
            ],
            mobile2: [
                '',
                Validators.compose([
                    PhoneValidator.invalidCountryPhone(country),
                ]),
            ],
            whatsapp: [
                '',
                Validators.compose([
                    PhoneValidator.invalidCountryPhone(country),
                ]),
            ],
            email: ['', [patternValidator(EMAIL_REGEX)]],
        });

        this.user_data$ = this._authService.currentUser;
        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.user_data = data;

                this.submitForm.patchValue({
                    center_id: this.user_data.center_id,
                });

                this._cdr.markForCheck();
            });

        this._commonApiService.getStates().subscribe((data: any) => {
            this.states_data = data;
        });
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

    isVendorExists() {
        if (this.submitForm.value.name.length > 0) {
            this._commonApiService
                .isVendorExists(this.submitForm.value.name)
                .subscribe((data: any) => {
                    if (data.result.length > 0) {
                        if (data.result[0].id > 0) {
                            this.vExists = true;
                        }
                    } else {
                        this.vExists = false;
                    }

                    this._cdr.markForCheck();
                });
        }
    }

    onSubmit() {
        if (!this.submitForm.valid) {
            return false;
        }

        if (this.vExists) {
            return false;
        }

        this._commonApiService
            .addVendor(this.submitForm.value)
            .subscribe((data: any) => {
                if (data.body.id > 0) {
                    this.dialogRef.close('success');
                }
            });
    }

    addVendor() {
        this._router.navigate([`/home/vendor/add`]);
    }

    reset() {}

    close() {
        this.dialogRef.close('close');
    }
}
