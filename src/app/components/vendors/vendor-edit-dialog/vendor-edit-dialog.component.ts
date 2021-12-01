import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ViewChild,
    ChangeDetectionStrategy,
    Inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

import { Validators, FormBuilder, AbstractControl } from '@angular/forms';

import { CommonApiService } from 'src/app/services/common-api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Vendor } from 'src/app/models/Vendor';
import { LoadingService } from '../../loading/loading.service';
import { patternValidator } from 'src/app/util/validators/pattern-validator';

import {
    GST_N_REGEX,
    EMAIL_REGEX,
    PIN_CODE_REGEX,
    country,
} from '../../../util/helper/patterns';
import { PhoneValidator } from 'src/app/util/validators/phone.validator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { plainToClass } from 'class-transformer';

@Component({
    selector: 'app-vendor-dialog',
    templateUrl: './vendor-edit-dialog.component.html',
    styleUrls: ['./vendor-edit-dialog.component.scss'],
    providers: [LoadingService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorEditDialogComponent implements OnInit {
    center_id: any;
    id: any;
    resultList: any;
    submitForm: any;

    states_data: any;
    isLinear = true;

    vendor: Vendor;
    vExists = false;

    current_vendor_name: any;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) vendor: Vendor,
        private dialogRef: MatDialogRef<VendorEditDialogComponent>,
        private _route: ActivatedRoute,
        private _authService: AuthenticationService,
        private _loadingService: LoadingService,
        private _commonApiService: CommonApiService
    ) {
        const currentUser = this._authService.currentUserValue;
        this.center_id = currentUser.center_id;

        this.vendor = vendor;
        this.current_vendor_name = vendor.vendor_name;

        this.submitForm = this._formBuilder.group({
            id: [this.vendor.id],
            center_id: [this.center_id],
            vendor_name: [this.vendor.vendor_name, Validators.required],
            address1: [this.vendor.address1],
            address2: [this.vendor.address2],
            address3: [this.vendor.address3],

            district: [this.vendor.district],
            state_id: [this.vendor.state_id.toString(), Validators.required],
            pin: [this.vendor.pin, [patternValidator(PIN_CODE_REGEX)]],

            gst: [this.vendor.gst, [patternValidator(GST_N_REGEX)]],

            phone: [
                this.vendor.phone,
                Validators.compose([
                    Validators.required,
                    PhoneValidator.invalidCountryPhone(country),
                ]),
            ],

            mobile: [
                this.vendor.mobile,
                Validators.compose([
                    Validators.required,
                    PhoneValidator.invalidCountryPhone(country),
                ]),
            ],

            mobile2: [
                this.vendor.mobile2,
                Validators.compose([
                    PhoneValidator.invalidCountryPhone(country),
                ]),
            ],

            whatsapp: [
                this.vendor.whatsapp,
                Validators.compose([
                    PhoneValidator.invalidCountryPhone(country),
                ]),
            ],

            email: [this.vendor.email, [patternValidator(EMAIL_REGEX)]],
        });

        this._commonApiService.getStates().subscribe((data: any) => {
            this.states_data = data;
            this._cdr.markForCheck();
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

    onSubmit() {
        if (this.current_vendor_name !== this.submitForm.value.vendor_name) {
            this._commonApiService
                .isVendorExists(this.submitForm.value.vendor_name)
                .subscribe((data: any) => {
                    if (data.result > 0) {
                        this.vExists = true;
                        this.openSnackBar('Duplicate Vendor Name', '');
                    } else {
                        this.vExists = false;
                        this.onSubmitAdd();
                    }
                });
        } else {
            this.onSubmitAdd();
        }
        this._cdr.markForCheck();
    }

    onSubmitAdd() {
        const vendor = plainToClass(Vendor, this.submitForm.value);

        const updateVendor$ = this._commonApiService.updateVendor(vendor);

        this._loadingService
            .showLoaderUntilCompleted(updateVendor$)
            .subscribe((data: any) => {
                console.log('object.. vendor updated ..');
                this.openSnackBar('Vendor Updated Successfully', '');
                this.dialogRef.close('success');
            });
    }

    searchVendors() {
        this._router.navigate([`/home/view-vendors`]);
    }

    addVendor() {
        this._router.navigate([`/home/vendor/add`]);
    }

    close() {
        this.dialogRef.close();
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 2000,
            panelClass: ['mat-toolbar', 'mat-primary'],
        });
    }
}

// dnd
//   (this.submitForm.get('formArray')).get([0]).patchValue({ 'name': this.resultList.name });
