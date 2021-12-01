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
    country,
    PIN_CODE_REGEX,
    EMAIL_REGEX,
} from 'src/app/util/helper/patterns';
import { PhoneValidator } from 'src/app/util/validators/phone.validator';
import { AlertController } from '@ionic/angular';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
    selector: 'app-customer-add-dialog',
    templateUrl: './customer-add-dialog.component.html',
    styleUrls: ['./customer-add-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerAddDialogComponent implements OnInit {
    center_id: any;
    vendor_id: any;
    resultList: any;
    submitForm: any;

    states_data: any;
    isLinear = true;

    c_exists: any;
    executed: boolean;

    discountType = ['NET'];
    responseMsg;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _loadingService: LoadingService,
        public alertController: AlertController,
        private dialogRef: MatDialogRef<CustomerAddDialogComponent>,
        private _route: ActivatedRoute,
        private _authService: AuthenticationService,

        private _commonApiService: CommonApiService
    ) {
        const currentUser = this._authService.currentUserValue;
        this.center_id = currentUser.center_id;

        this.submitForm = this._formBuilder.group({
            center_id: [this.center_id],
            name: ['', Validators.required],

            address1: [''],
            address2: [''],

            district: [''],
            state_id: ['', Validators.required],
            pin: ['', [patternValidator(PIN_CODE_REGEX)]],
            gst: ['', [patternValidator(GST_N_REGEX)]],
            phone: [
                '',
                Validators.compose([
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

            disc_type: ['NET', Validators.required],
            gst_zero: [0, [Validators.max(100), Validators.min(0)]],
            gst_five: [0, [Validators.max(100), Validators.min(0)]],
            gst_twelve: [0, [Validators.max(100), Validators.min(0)]],
            gst_eighteen: [0, [Validators.max(100), Validators.min(0)]],
            gst_twenty_eight: [0, [Validators.max(100), Validators.min(0)]],
        });

        this._commonApiService.getStates().subscribe((data: any) => {
            this.states_data = data;
        });
    }

    ngOnInit() {
        this.responseMsg = '';
        this.executed = false;

        this.dialogRef.keydownEvents().subscribe((event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });

        this.dialogRef.backdropClick().subscribe((event) => {
            this.close();
        });
    }

    isCustomerExists() {
        if (this.submitForm.value.name.length > 0) {
            this._commonApiService
                .isCustomerExists(this.submitForm.value.name)
                .subscribe((data: any) => {
                    if (data.result.length > 0) {
                        if (data.result[0].id > 0) {
                            this.responseMsg = 'Customer Already Exists!';
                            this.c_exists = true;
                        }
                    } else {
                        this.c_exists = false;
                    }

                    this._cdr.markForCheck();
                });
        }
    }

    onSubmit() {
        if (!this.submitForm.valid) {
            this._loadingService.openSnackBar('Please check all fields', '');
            return false;
        }

        if (this.c_exists) {
            this.responseMsg = 'Customer Already Exists!';
            this._cdr.markForCheck();
            return false;
        }

        this._commonApiService
            .addCustomer(this.submitForm.value)
            .subscribe((data: any) => {
                if (data.body.id > 0) {
                    this.clear();
                    this.dialogRef.close('success');
                }
            });
    }

    close() {
        this.dialogRef.close('close');
    }

    searchCustomers() {
        this._router.navigate([`/home/view-customers`]);
    }

    addCustomer() {
        this._router.navigate([`/home/customer/add`]);
    }

    async presentAlert(msg: string) {
        const alert = await this.alertController.create({
            header: 'Message',

            message: msg,
            buttons: ['OK'],
        });

        await alert.present();
        setTimeout(() => {
            this.searchCustomers();
        }, 1000);
    }

    clear() {
        this.submitForm.reset();
        this.submitForm.patchValue({
            disc_type: 'NET',
            gst_zero: 0,
            gst_five: 0,
            gst_twelve: 0,
            gst_eighteen: 0,
            gst_twenty_eight: 0,
        });
    }

    // openSnackBar(message: string, action: string) {
    // 	this._snackBar.open(message, action, {
    // 		duration: 2000,
    // 		panelClass: ['mat-toolbar', 'mat-primary'],
    // 	});
    // }

    prepopulate() {
        if (!this.executed) {
            this.submitForm.patchValue({
                gst_five: this.submitForm.value.gst_zero,
                gst_twelve: this.submitForm.value.gst_zero,
                gst_eighteen: this.submitForm.value.gst_zero,
                gst_twenty_eight: this.submitForm.value.gst_zero,
            });
        }

        this.executed = true;
        this._cdr.markForCheck();
    }
}
