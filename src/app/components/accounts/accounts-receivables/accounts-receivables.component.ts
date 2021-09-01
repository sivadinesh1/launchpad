import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonApiService } from 'src/app/services/common-api.service';
import { CurrencyPadComponent } from 'src/app/components/currency-pad/currency-pad.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User';
import { filter, startWith, map, distinctUntilChanged } from 'rxjs/operators';
import { Customer } from 'src/app/models/Customer';
import { CurrencyPipe } from '@angular/common';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
	selector: 'app-accounts-receivables',
	templateUrl: './accounts-receivables.component.html',
	styleUrls: ['./accounts-receivables.component.scss'],

	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsReceivablesComponent implements OnInit {
	customerAdded = false;
	submitForm: FormGroup;

	removeRowArr = [];
	showDelIcon = false;

	maxDate = new Date();

	pymtmodes$: Observable<any>;
	userdata: any;

	userdata$: Observable<User>;

	customer: Customer;
	invoice: any;
	summed = 0;

	errmsg: any;
	balancedue: any;

	filteredCustomer: Observable<any[]>;
	customer_lis: Customer[];
	tabIndex = 0;

	iscustomerselected = false;
	invoicesdata: any;

	customerUnpaidInvoices: any;
	origCustomerUnpaidInvoices: any;
	invoiceamount = 0;
	paidamount = 0;
	distributeBalance = 0;

	invoicesplitArr = [];
	advanceCreditUsed = 0;

	bankList: any;
	iswarning = false;

	constructor(
		private _fb: FormBuilder,
		public dialog: MatDialog,
		private currencyPipe: CurrencyPipe,
		private dialogRef: MatDialogRef<AccountsReceivablesComponent>,
		private _authservice: AuthenticationService,
		@Inject(MAT_DIALOG_DATA) data: any,
		private _modalcontroller: ModalController,
		private _router: Router,
		private _route: ActivatedRoute,
		private _cdr: ChangeDetectorRef,
		private _commonApiService: CommonApiService,
		private _loadingService: LoadingService,
	) {
		this.invoicesdata = data.invoicesdata;

		this.userdata$ = this._authservice.currentUser;

		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this.userdata = data;

			this.init();
			this._cdr.markForCheck();
		});

		this._route.params.subscribe((params) => {
			if (this.userdata !== undefined) {
				this.init();
			}
		});
	}

	async init() {
		// onload list all active customers in the dropdown
		this._commonApiService.getAllActiveCustomers(this.userdata.center_id).subscribe((data: any) => {
			this.customer_lis = data;

			this.filteredCustomer = this.submitForm.controls['customer'].valueChanges.pipe(
				startWith(''),
				map((customer) => (customer ? this.filtercustomer(customer) : this.customer_lis.slice())),
			);
		});

		// fetch all payment mode list
		this.pymtmodes$ = this._commonApiService.getAllActivePymtModes(this.userdata.center_id, 'A');

		this.reloadBankDetails();
	}

	// filter customers as we type
	filtercustomer(value: any) {
		if (typeof value == 'object') {
			return this.customer_lis.filter((customer) => customer.name.toLowerCase().match(value.name.toLowerCase()));
		} else if (typeof value == 'string') {
			return this.customer_lis.filter((customer) => customer.name.toLowerCase().match(value.toLowerCase()));
		}
	}

	ngOnInit() {
		// init form values
		this.submitForm = this._fb.group({
			customer: ['', Validators.required],
			centerid: [this.userdata.center_id, Validators.required],
			accountarr: this._fb.array([]),
			invoicesplit: [],
			balancedue: [],
			appliedamount: [],
			creditsused: 'NO',
			creditusedamount: 0,
			bank_id: '',
			bank_name: '',
			createdby: this.userdata.userid,
		});

		this.dialogRef.keydownEvents().subscribe((event) => {
			if (event.key === 'Escape') {
				this.close();
			}
		});

		this.dialogRef.backdropClick().subscribe((event) => {
			this.close();
		});
	}

	reloadBankDetails() {
		this._commonApiService.getBanks(this.userdata.center_id).subscribe((data: any) => {
			this.bankList = data.result;

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
				bank_name: event.value.bankname,
				bank_id: event.value.id,
			});
		}
	}

	// on blur of received amount
	blurFn() {
		this.checkTotalSum();
		// this._cdr.detectChanges();
	}

	// initialize the values
	initAccount() {
		return this._fb.group({
			checkbox: [false],

			receivedamount: ['', [Validators.required, Validators.min(1)]],
			appliedamount: [''],
			receiveddate: ['', Validators.required],
			pymtmode: ['', Validators.required],
			bankref: [''],
			pymtref: [''],
		});
	}

	get accountarr(): FormGroup {
		return this.submitForm.get('accountarr') as FormGroup;
	}

	// adds one line item for payment
	addAccount() {
		const control = <FormArray>this.submitForm.controls['accountarr'];
		control.push(this.initAccount());

		this.getBalanceDue();
		this._cdr.markForCheck();
	}

	ngAfterViewInit() {
		// this.checkTotalSum();
	}

	// method to calculate total payed now and balance due
	checkTotalSum() {
		this.summed = 0;
		this.invoicesplitArr = [];

		// deep  copy to new value
		this.origCustomerUnpaidInvoices = JSON.parse(JSON.stringify(this.customerUnpaidInvoices));

		const ctrl = <FormArray>this.submitForm.controls['accountarr'];

		let init = 0;

		// iterate each object in the form array
		ctrl.controls.forEach((x) => {
			// get the itemmt value and need to parse the input to number

			let parsed = parseFloat(x.get('receivedamount').value === '' || x.get('receivedamount').value === null ? 0 : x.get('receivedamount').value);
			// add to total

			this.summed += parsed;
			this.getBalanceDue();

			init++;
		});

		// after iterating all the line items (in this case, there will be only one row) distribute the amount paid (customer credit if any) to all invoices
		if (init == ctrl.controls.length) {
			this.distributeBalance = +(this.summed + this.customer.credit_amt).toFixed(2);

			this.origCustomerUnpaidInvoices.map((e) => {
				if (this.distributeBalance > 0) {
					if (e.bal_amount > 0 && +(e.bal_amount - this.distributeBalance).toFixed(2) <= 0) {
						//excess distribution
						e.paid_amount = e.bal_amount;
						this.distributeBalance = +(this.distributeBalance - e.bal_amount).toFixed(2);
						e.bal_amount = 0;
						this.invoicesplitArr.push({
							id: e.sale_id,
							applied_amount: e.paid_amount,
						});
					} else if (e.bal_amount > 0 && +(e.bal_amount - this.distributeBalance).toFixed(2) > 0) {
						//shortage distribution
						e.paid_amount = this.distributeBalance;
						e.bal_amount = +(e.bal_amount - this.distributeBalance).toFixed(2);
						this.distributeBalance = 0;
						this.invoicesplitArr.push({
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
		this.balancedue = (+this.invoiceamount - (+this.paidamount + this.customer.credit_amt + this.summed)).toFixed(2);

		if (+this.balancedue < 0) {
			this.errmsg = 'Amount paid is more than invoice outstanding. Excess amount will be moved to customer credit.';
			this._cdr.markForCheck();
		} else {
			this.errmsg = '';
			this._cdr.markForCheck();
		}
	}

	onSubmit() {
		if (this.checkTotalSum()) {
			let form = {
				centerid: this.userdata.center_id,
				bankref: this.submitForm.value.accountarr[0].bankref,
				customerid: this.customer.id,
			};

			this._commonApiService.getPaymentBankRef(form).subscribe((data: any) => {
				if (data.body.result[0].count > 0) {
					// warning
					this.iswarning = true;
					this._cdr.markForCheck();
				} else if (data.body.result1.length === 1) {
					// check if the last paid amount is the same is current paid amount and if yes throw a warning.
					if (data.body.result1[0].payment_now_amt === this.submitForm.value.accountarr[0].receivedamount) {
						this.iswarning = true;
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

	cancel() {
		this.iswarning = false;
	}

	finalSubmit() {
		if (this.checkTotalSum()) {
			this.submitForm.patchValue({
				invoicesplit: this.invoicesplitArr,
				customer: this.customer,
				balancedue: this.balancedue,
			});

			if (this.customer.credit_amt > 0) {
				this.submitForm.patchValue({
					creditsused: 'YES',
					creditusedamount: this.customer.credit_amt,
				});
			}

			this._commonApiService.addBulkPymtReceived(this.submitForm.value).subscribe((data: any) => {
				if (data.body === 'success') {
					this.submitForm.reset();
					this.dialogRef.close('close');
					this._loadingService.openSnackBar('Payments Recorded Successfully', '');
				} else {
					// todo nothing as of now
				}
				this._cdr.markForCheck();
			});
		}
	}

	close() {
		this.dialogRef.close();
	}

	getPosts(event) {
		const control = <FormArray>this.submitForm.controls['accountarr'];
		control.removeAt(0);

		this.submitForm.patchValue({
			customerid: event.option.value.id,
			customer: event.option.value.name,
		});

		this.customer = event.option.value;

		// get all unpaid invoices for a customer

		this.customerUnpaidInvoices = this.invoicesdata
			.filter((e) => e.customer_id === event.option.value.id)
			.filter((e1) => e1.payment_status != 'PAID');

		this.origCustomerUnpaidInvoices = JSON.parse(JSON.stringify(this.customerUnpaidInvoices));

		this.invoiceamount = this.customerUnpaidInvoices
			.reduce(function (acc, curr) {
				return acc + curr.invoice_amt;
			}, 0)
			.toFixed(2);

		this.paidamount = this.customerUnpaidInvoices
			.reduce(function (acc, curr) {
				return acc + curr.paid_amount;
			}, 0)
			.toFixed(2);

		this.iscustomerselected = true;

		this.addAccount();

		this._cdr.markForCheck();
	}

	clearInput() {
		this.submitForm.patchValue({
			customerid: 'all',
			customer: '',
		});
		this.initAccount();
		this.iscustomerselected = false;
		this._cdr.markForCheck();
	}
}
