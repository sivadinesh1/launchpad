import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalController, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonApiService } from 'src/app/services/common-api.service';
import { CurrencyPadComponent } from 'src/app/components/currency-pad/currency-pad.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User';
import { filter, startWith, map, distinctUntilChanged } from 'rxjs/operators';

import { CurrencyPipe } from '@angular/common';
import { Vendor } from 'src/app/models/Vendor';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
	selector: 'app-accounts-payables',
	templateUrl: './accounts-payables.component.html',
	styleUrls: ['./accounts-payables.component.scss'],

	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsPayablesComponent implements OnInit {
	vendorAdded = false;
	submitForm: FormGroup;

	removeRowArr = [];
	showDelIcon = false;

	maxDate = new Date();

	pymtmodes$: Observable<any>;
	userdata: any;

	userdata$: Observable<User>;

	vendor: Vendor;
	invoice: any;
	summed = 0;

	errmsg: any;
	balancedue: any;

	filteredVendor: Observable<any[]>;
	vendor_lis: Vendor[];
	tabIndex = 0;

	isvendorselected = false;
	invoicesdata: any;

	vendorUnpaidInvoices: any;
	origVendorUnpaidInvoices: any;
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
		private dialogRef: MatDialogRef<AccountsPayablesComponent>,
		private _authservice: AuthenticationService,
		@Inject(MAT_DIALOG_DATA) data: any,
		private _modalcontroller: ModalController,
		private _router: Router,
		private _route: ActivatedRoute,
		private _cdr: ChangeDetectorRef,
		private _commonApiService: CommonApiService,
		private _loadingService: LoadingService,
		public alertController: AlertController,
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
		// onload list all active vendors in the dropdown
		this._commonApiService.getAllActiveVendors(this.userdata.center_id).subscribe((data: any) => {
			this.vendor_lis = data;
			// autocomplete as typing
			this.filteredVendor = this.submitForm.controls['vendor'].valueChanges.pipe(
				startWith(''),
				map((vendor) => (vendor ? this.filtervendor(vendor) : this.vendor_lis.slice())),
			);
		});

		// fetch all payment mode list
		this.pymtmodes$ = this._commonApiService.getAllActivePymtModes(this.userdata.center_id, 'A');
	}

	// filter vendors as we type
	filtervendor(value: any) {
		if (typeof value == 'object') {
			return this.vendor_lis.filter((vendor) => vendor.name.toLowerCase().indexOf(value.name.toLowerCase()) === 0);
		} else if (typeof value == 'string') {
			return this.vendor_lis.filter((vendor) => vendor.name.toLowerCase().indexOf(value.toLowerCase()) === 0);
		}
	}

	ngOnInit() {
		// init form values
		this.submitForm = this._fb.group({
			vendor: ['', Validators.required],
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

		this.reloadBankDetails();
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

	reloadBankDetails() {
		this._commonApiService.getBanks(this.userdata.center_id).subscribe((data: any) => {
			this.bankList = data.result;

			this._cdr.markForCheck();
		});
	}

	// method to calculate total payed now and balance due
	checkTotalSum() {
		this.summed = 0;
		this.invoicesplitArr = [];

		// deep  copy to new value
		this.origVendorUnpaidInvoices = JSON.parse(JSON.stringify(this.vendorUnpaidInvoices));

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

		// after iterating all the line items (in this case, there will be only one row) distribute the amount paid (vendor credit if any) to all invoices
		if (init == ctrl.controls.length) {
			this.distributeBalance = +(this.summed + this.vendor.credit_amt).toFixed(2);

			this.origVendorUnpaidInvoices.map((e) => {
				if (this.distributeBalance > 0) {
					if (e.bal_amount > 0 && +(e.bal_amount - this.distributeBalance).toFixed(2) <= 0) {
						//excess distribution
						e.paid_amount = e.bal_amount;
						this.distributeBalance = +(this.distributeBalance - e.bal_amount).toFixed(2);
						e.bal_amount = 0;
						this.invoicesplitArr.push({
							id: e.purchase_id,
							applied_amount: e.paid_amount,
						});
					} else if (e.bal_amount > 0 && +(e.bal_amount - this.distributeBalance).toFixed(2) > 0) {
						//shortage distribution
						e.paid_amount = this.distributeBalance;
						e.bal_amount = +(e.bal_amount - this.distributeBalance).toFixed(2);
						this.distributeBalance = 0;
						this.invoicesplitArr.push({
							id: e.purchase_id,
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
		this.balancedue = (+this.invoiceamount - (+this.paidamount + this.vendor.credit_amt + this.summed)).toFixed(2);

		if (+this.balancedue < 0) {
			this.errmsg = 'Amount paid is more than invoice outstanding. Excess amount will be moved to vendor credit.';
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
				vendorid: this.vendor.id,
			};

			this._commonApiService.getVendorPaymentBankRef(form).subscribe((data: any) => {
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
				vendor: this.vendor,
				balancedue: this.balancedue,
			});

			if (this.vendor.credit_amt > 0) {
				this.submitForm.patchValue({
					creditsused: 'YES',
					creditusedamount: this.vendor.credit_amt,
				});
			}
		}

		this._commonApiService.addBulkVendorPymtReceived(this.submitForm.value).subscribe((data: any) => {
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

	close() {
		this.dialogRef.close();
	}

	getPosts(event) {
		const control = <FormArray>this.submitForm.controls['accountarr'];
		control.removeAt(0);

		this.submitForm.patchValue({
			vendorid: event.option.value.id,
			vendor: event.option.value.name,
		});

		this.vendor = event.option.value;

		// get all unpaid invoices for a vendor

		this.vendorUnpaidInvoices = this.invoicesdata.filter((e) => e.vendor_id === event.option.value.id).filter((e1) => e1.payment_status != 'PAID');

		this.origVendorUnpaidInvoices = JSON.parse(JSON.stringify(this.vendorUnpaidInvoices));

		this.invoiceamount = this.vendorUnpaidInvoices
			.reduce(function (acc, curr) {
				return acc + curr.invoice_amt;
			}, 0)
			.toFixed(2);

		this.paidamount = this.vendorUnpaidInvoices
			.reduce(function (acc, curr) {
				return acc + curr.paid_amount;
			}, 0)
			.toFixed(2);

		this.isvendorselected = true;

		this.addAccount();

		this._cdr.markForCheck();
	}

	clearInput() {
		this.submitForm.patchValue({
			vendorid: 'all',
			vendor: '',
		});
		this._cdr.markForCheck();
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
