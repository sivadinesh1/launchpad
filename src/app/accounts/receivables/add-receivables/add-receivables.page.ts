import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { Customer } from 'src/app/models/Customer';
import { User } from 'src/app/models/User';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { filter, startWith, map, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-add-receivables',
    templateUrl: './add-receivables.page.html',
    styleUrls: ['./add-receivables.page.scss'],
})
export class AddReceivablesPage implements OnInit {
    filteredCustomer: Observable<any[]>;
    customer_lis: Customer[];
    bankList: any;

    paymentModes$: Observable<any>;

    submitForm: FormGroup;
    user_data: any;

    user_data$: Observable<User>;

    customer: Customer;

    customerUnpaidInvoices: any;
    origCustomerUnpaidInvoices: any;
    invoice_amount = 0;
    paid_amount = 0;
    distributeBalance = 0;

    invoice_split_Arr = [];
    advanceCreditUsed = 0;
    invoice: any;
    summed = 0;

    errorMsg: any;
    balance_due: any;
    is_warning = false;
    maxDate = new Date();
    is_customer_selected = false;
    invoices_data: any;

    constructor(
        private _fb: FormBuilder,
        private currencyPipe: CurrencyPipe,
        private _authService: AuthenticationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _commonApiService: CommonApiService,
        private _loadingService: LoadingService,
        private _snackBar: MatSnackBar
    ) {
        this.user_data$ = this._authService.currentUser;

        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.user_data = data;
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
        // onload list all active customers in the dropdown
        this._commonApiService
            .getAllActiveCustomers()
            .subscribe((data: any) => {
                this.customer_lis = data;

                this.filteredCustomer =
                    this.submitForm.controls.customer.valueChanges.pipe(
                        startWith(''),
                        map((customer) =>
                            customer
                                ? this.filterCustomer(customer)
                                : this.customer_lis.slice()
                        )
                    );
            });

        // fetch all payment mode list
        this.paymentModes$ =
            this._commonApiService.getAllActivePaymentModes('A');

        this.reloadBankDetails();

        // init form values
        this.submitForm = this._fb.group({
            customer: ['', Validators.required],
            center_id: [this.user_data.center_id, Validators.required],
            account_arr: this._fb.array([]),
            invoice_split: [],
            balance_due: [],
            applied_amount: [],
            credits_used: 'NO',
            credit_used_amount: 0,
            bank_id: '',
            bank_name: '',
            created_by: this.user_data.user_id,
        });

        this.initAccount();
        this.clearInput();
    }

    reloadBankDetails() {
        this._commonApiService.getBanks().subscribe((data: any) => {
            this.bankList = data;

            this._cdr.markForCheck();
        });
    }

    handleChange(event) {
        if (event.value === '0') {
            this.submitForm.patchValue({
                bank_name: '',
                bank_id: 0,
            });
        } else {
            this.submitForm.patchValue({
                bank_name: event.value.bank_name,
                bank_id: event.value.id,
            });
        }
    }

    // on blur of received amount
    blurFn() {
        this.checkTotalSum();
        // this._cdr.detectChanges();
    }

    // filter customers as we type
    filterCustomer(value: any) {
        if (typeof value == 'object') {
            return this.customer_lis.filter((customer) =>
                customer.name.toLowerCase().match(value.name.toLowerCase())
            );
        } else if (typeof value == 'string') {
            return this.customer_lis.filter((customer) =>
                customer.name.toLowerCase().match(value.toLowerCase())
            );
        }
    }

    ngOnInit() {}

    get account_arr(): FormGroup {
        return this.submitForm.get('account_arr') as FormGroup;
    }

    // adds one line item for payment
    addAccount() {
        //   const control = this.submitForm.get('account_arr') as FormArray;
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const control = <FormArray>this.submitForm.controls.account_arr;
        control.push(this.initAccount());

        this.getBalanceDue();
        this._cdr.markForCheck();
    }

    // initialize the values
    initAccount() {
        return this._fb.group({
            checkbox: [false],

            received_amount: ['', [Validators.required, Validators.min(1)]],
            applied_amount: [''],
            received_date: ['', Validators.required],
            payment_mode: ['', Validators.required],
            bank_ref: [''],
            payment_ref: [''],
        });
    }

    getPosts(event) {
        //const control = this.submitForm.get('account_arr') as FormArray;
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const control = <FormArray>this.submitForm.controls.account_arr;

        control.removeAt(0);

        this.submitForm.patchValue({
            customer_id: event.option.value.id,
            customer: event.option.value.name,
        });

        this.customer = event.option.value;

        this._commonApiService
            .getCustomerUnpaidInvoices(event.option.value.id)
            .subscribe((data) => {
                console.log('home many times');
                this.origCustomerUnpaidInvoices = data;
                this.customerUnpaidInvoices = data;

                this.invoice_amount = this.customerUnpaidInvoices
                    .reduce((acc, curr) => acc + curr.invoice_amt, 0)
                    .toFixed(2);

                this.paid_amount = this.customerUnpaidInvoices
                    .reduce((acc, curr) => acc + curr.paid_amount, 0)
                    .toFixed(2);

                this.is_customer_selected = true;

                this.addAccount();

                this._cdr.markForCheck();

                this._cdr.markForCheck();
            });

        // get all unpaid invoices for a customer

        // to delete
        // this.customerUnpaidInvoices = this.invoices_data
        //     .filter((e) => e.customer_id === event.option.value.id)
        //     .filter((e1) => e1.payment_status !== 'PAID');

        // this.origCustomerUnpaidInvoices = JSON.parse(
        //     JSON.stringify(this.customerUnpaidInvoices)
        // );

        // to delete
    }

    clearInput() {
        this.submitForm.patchValue({
            customer_id: 'all',
            customer: '',
        });
        // this.initAccount();
        // this.is_customer_selected = false;
        this._cdr.markForCheck();
    }

    // method to calculate total payed now and balance due
    checkTotalSum() {
        this.summed = 0;
        this.invoice_split_Arr = [];

        // deep  copy to new value
        this.origCustomerUnpaidInvoices = JSON.parse(
            JSON.stringify(this.customerUnpaidInvoices)
        );

        // const ctrl = this.submitForm.get('account_arr') as FormArray;
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const ctrl = <FormArray>this.submitForm.controls.account_arr;

        let init = 0;

        // iterate each object in the form array
        ctrl.controls.forEach((x) => {
            // get the item amount value and need to parse the input to number

            const parsed = parseFloat(
                x.get('received_amount').value === '' ||
                    x.get('received_amount').value === null
                    ? 0
                    : x.get('received_amount').value
            );
            // add to total

            this.summed += parsed;
            this.getBalanceDue();

            init++;
        });

        // after iterating all the line items (in this case, there will be only one row) distribute the amount paid (customer credit if any) to all invoices
        if (init === ctrl.controls.length) {
            this.distributeBalance = +(
                this.summed + this.customer.credit_amt
            ).toFixed(2);

            this.origCustomerUnpaidInvoices.map((e) => {
                if (this.distributeBalance > 0) {
                    if (
                        e.bal_amount > 0 &&
                        +(e.bal_amount - this.distributeBalance).toFixed(2) <= 0
                    ) {
                        //excess distribution
                        e.paid_amount = e.bal_amount;
                        this.distributeBalance = +(
                            this.distributeBalance - e.bal_amount
                        ).toFixed(2);
                        e.bal_amount = 0;
                        this.invoice_split_Arr.push({
                            id: e.sale_id,
                            applied_amount: e.paid_amount,
                        });
                    } else if (
                        e.bal_amount > 0 &&
                        +(e.bal_amount - this.distributeBalance).toFixed(2) > 0
                    ) {
                        //shortage distribution
                        e.paid_amount = this.distributeBalance;
                        e.bal_amount = +(
                            e.bal_amount - this.distributeBalance
                        ).toFixed(2);
                        this.distributeBalance = 0;
                        this.invoice_split_Arr.push({
                            id: e.sale_id,
                            applied_amount: e.paid_amount,
                        });
                    }
                }

                this._cdr.markForCheck();
            });
        }

        return true;
    }

    getBalanceDue() {
        this.balance_due = (
            +this.invoice_amount -
            (+this.paid_amount + this.customer.credit_amt + this.summed)
        ).toFixed(2);

        if (+this.balance_due < 0) {
            this.errorMsg =
                'Amount paid is more than invoice outstanding. Excess amount will be moved to customer credit.';
            this._cdr.markForCheck();
        } else {
            this.errorMsg = '';
            this._cdr.markForCheck();
        }
    }

    onSubmit() {
        if (this.checkTotalSum()) {
            const form = {
                center_id: this.user_data.center_id,
                bank_ref: this.submitForm.value.account_arr[0].bank_ref,
                customer_id: this.customer.id,
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
            this.submitForm.patchValue({
                invoice_split: this.invoice_split_Arr,
                customer: this.customer,
                balance_due: this.balance_due,
            });

            if (this.customer.credit_amt > 0) {
                this.submitForm.patchValue({
                    credits_used: 'YES',
                    credit_used_amount: this.customer.credit_amt,
                });
            }

            this._commonApiService
                .addBulkPaymentReceived(this.submitForm.value)
                .subscribe((data: any) => {
                    if (data.body.result === 'success') {
                        this.submitForm.reset();
                        this.clearInput();

                        // this._loadingService.openSnackBar(
                        //     'Payments Recorded Successfully',
                        //     ''
                        // );
                        this.openSnackBar(
                            `Payments Recorded Successfully!`,
                            '',
                            'mat-primary'
                        );

                        this._router.navigateByUrl('/home/receivables');
                    } else {
                        // todo nothing as of now
                    }
                    this._cdr.markForCheck();
                });
        }
    }

    cancel() {
        this.is_warning = false;
    }

    balanceCheckColor(item) {
        if (item.bal_amount > 0) {
            return 'red';
        } else {
            return 'green';
        }
    }

    openSnackBar(message: string, action: string, color: string) {
        this._snackBar.open(message, action, {
            duration: 2000,
            panelClass: ['mat-toolbar', color],
        });
    }
}
