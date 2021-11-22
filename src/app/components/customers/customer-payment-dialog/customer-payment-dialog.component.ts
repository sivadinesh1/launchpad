import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    Inject,
    AfterViewInit,
} from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';

import {
    MatDialog,
    MAT_DIALOG_DATA,
    MatDialogRef,
} from '@angular/material/dialog';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonApiService } from 'src/app/services/common-api.service';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User';
import { filter } from 'rxjs/operators';

import { Customer } from 'src/app/models/Customer';

import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-customer-payment-dialog',
    templateUrl: './customer-payment-dialog.component.html',
    styleUrls: ['./customer-payment-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerPaymentDialogComponent implements OnInit, AfterViewInit {
    customerAdded = false;
    submitForm: FormGroup;
    customerData: any;

    showDelIcon = false;

    maxDate = new Date();

    paymentModes$: Observable<any>;
    user_data: any;

    user_data$: Observable<User>;

    customer: Customer;
    invoice: any;
    summed = 0;

    errorMsg: any;
    balance_due: any;
    bankList: any;
    is_warning = false;

    constructor(
        private _fb: FormBuilder,
        public dialog: MatDialog,
        private currencyPipe: CurrencyPipe,
        private dialogRef: MatDialogRef<CustomerPaymentDialogComponent>,
        private _authService: AuthenticationService,
        @Inject(MAT_DIALOG_DATA) data: any,

        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _commonApiService: CommonApiService
    ) {
        this.customer = data.customer_data;
        this.invoice = data.invoice_data;

        this.user_data$ = this._authService.currentUser;

        this.user_data$
            .pipe(filter((data1) => data1 !== null))
            .subscribe((data2: any) => {
                this.user_data = data2;
                this.init();
                this._cdr.markForCheck();
            });

        this._route.params.subscribe((params) => {
            if (this.user_data !== undefined) {
                this.init();
            }
        });
    }

    async init() {
        this.paymentModes$ = this._commonApiService.getAllActivePymtModes('A');
    }

    ngOnInit() {
        // init form values
        this.submitForm = this._fb.group({
            customer: [this.customer, Validators.required],
            center_id: [this.user_data.center_id, Validators.required],
            account_arr: this._fb.array([]),
            bank_id: '',
            bank_name: '',
            created_by: this.user_data.user_id,
        });

        // adds first record
        this.addAccount();

        // subscribes to values changes of "account_arr"
        this.submitForm.get('account_arr').valueChanges.subscribe((values) => {
            this.checkTotalSum();
            this._cdr.detectChanges();
        });

        this.dialogRef.keydownEvents().subscribe((event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });

        this.dialogRef.backdropClick().subscribe((event) => {
            this.close();
        });
        this.reloadBankDetails();
    }

    // initialize the values
    initAccount() {
        return this._fb.group({
            checkbox: [false],
            sale_ref_id: [this.invoice.sale_id, [Validators.required]],
            received_amount: [
                '',
                [
                    Validators.required,
                    Validators.max(this.invoice.invoice_amt),
                    Validators.min(0),
                ],
            ],
            receiveddate: ['', Validators.required],
            pymtmode: ['', Validators.required],
            bankref: [''],
            pymtref: [''],
        });
    }

    get account_arr(): FormGroup {
        return this.submitForm.get('account_arr') as FormGroup;
    }

    addAccount() {
        const control = this.submitForm.controls.account_arr as FormArray;
        control.push(this.initAccount());

        this._cdr.markForCheck();
    }

    ngAfterViewInit() {
        this.getbalance_due();
    }

    reloadBankDetails() {
        this._commonApiService.getBanks().subscribe((data: any) => {
            this.bankList = data.result;

            this._cdr.markForCheck();
        });
    }

    // method to calculate total payed now and balance due
    checkTotalSum() {
        this.summed = 0;

        const ctrl = this.submitForm.get('account_arr') as FormArray;

        // iterate each object in the form array
        ctrl.controls.forEach((x) => {
            // get the itemmt value and need to parse the input to number

            const parsed = parseFloat(
                x.get('received_amount').value === '' ||
                    x.get('received_amount').value === null
                    ? 0
                    : x.get('received_amount').value
            );
            // add to total

            this.summed += parsed;
            this.getbalance_due();

            // current set of paymnets + already paid amount > actual invocie amount then error
            if (
                this.summed + this.invoice.paid_amount >
                this.invoice.invoice_amt
            ) {
                const val = this.currencyPipe.transform(
                    this.summed +
                        this.invoice.paid_amount -
                        this.invoice.invoice_amt,
                    'INR'
                );
                this.errorMsg = `Total payment exceeds invoice amount ` + val;
                this._cdr.detectChanges();
                return false;
            } else {
                this.errorMsg = ``;
                this._cdr.detectChanges();
            }
        });
        return true;
    }

    getbalance_due() {
        this.balance_due =
            this.invoice.invoice_amt - (this.invoice.paid_amount + this.summed);
    }

    onSubmit() {
        if (this.checkTotalSum()) {
            const form = {
                center_id: this.user_data.center_id,
                bankref: this.submitForm.value.account_arr[0].bankref,
                customerid: this.submitForm.value.customer.id,
            };

            this._commonApiService
                .getPaymentBankRef(form)
                .subscribe((data: any) => {
                    if (data.body.result[0].count > 0) {
                        // warning
                        this.is_warning = true;
                        this._cdr.markForCheck();
                    } else if (data.body.result1.length === 1) {
                        // check if the last paid amount is the same is current paid amount and if yes throw a warning.
                        if (
                            data.body.result1[0].payment_now_amt ===
                            this.submitForm.value.account_arr[0].received_amount
                        ) {
                            this.is_warning = true;
                            this._cdr.markForCheck();
                        } else {
                            this.finalSubmit();
                        }
                    } else {
                        this.finalSubmit();
                    }
                });
        }
    }

    finalSubmit() {
        if (this.checkTotalSum()) {
            if (this.checkTotalSum()) {
                this._commonApiService
                    .addPymtReceived(this.submitForm.value)
                    .subscribe((data: any) => {
                        if (data.body === 'success') {
                            this.submitForm.reset();
                            this.dialogRef.close('success');
                        } else {
                            // todo nothing as of now
                        }
                        this._cdr.markForCheck();
                    });
            }
        }
    }

    cancel() {
        this.is_warning = false;
    }

    close() {
        this.dialogRef.close();
    }

    handleChange(event) {
        if (event.value === '0') {
            this.submitForm.patchValue({
                bank_name: '',
                bank_id: 0,
            });
        } else {
            this.submitForm.patchValue({
                bank_name: event.value.bankname,
                bank_id: event.value.id,
            });
        }
    }
}
