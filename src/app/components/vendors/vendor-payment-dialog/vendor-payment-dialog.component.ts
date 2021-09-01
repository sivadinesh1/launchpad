import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';

import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonApiService } from 'src/app/services/common-api.service';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User';
import { filter } from 'rxjs/operators';

import { CurrencyPipe } from '@angular/common';
import { Vendor } from 'src/app/models/Vendor';

@Component({
	selector: 'app-vendor-payment-dialog',
	templateUrl: './vendor-payment-dialog.component.html',
	styleUrls: ['./vendor-payment-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorPaymentDialogComponent implements OnInit {
	vendorAdded = false;
	submitForm: FormGroup;
	vendorData: any;

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
	bankList: any;
	iswarning = false;

	constructor(
		private _fb: FormBuilder,
		public dialog: MatDialog,
		private currencyPipe: CurrencyPipe,
		private dialogRef: MatDialogRef<VendorPaymentDialogComponent>,
		private _authservice: AuthenticationService,
		@Inject(MAT_DIALOG_DATA) data: any,
		private _modalcontroller: ModalController,
		private _router: Router,
		private _route: ActivatedRoute,
		private _cdr: ChangeDetectorRef,
		private _commonApiService: CommonApiService,
	) {
		this.vendor = data.vendordata;
		this.invoice = data.invoicedata;

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
		this.pymtmodes$ = this._commonApiService.getAllActivePymtModes(this.userdata.center_id, 'A');
	}

	ngOnInit() {
		// init form values
		this.submitForm = this._fb.group({
			vendor: [this.vendor, Validators.required],
			centerid: [this.userdata.center_id, Validators.required],
			accountarr: this._fb.array([]),
			bank_id: '',
			bank_name: '',
			createdby: this.userdata.userid,
		});

		// adds first record
		this.addAccount();

		// subscribes to values chages of "accountarr"
		this.submitForm.get('accountarr').valueChanges.subscribe((values) => {
			this.checkTotalSum();
			this._cdr.detectChanges();
		});

		this.reloadBankDetails();
	}

	// initialize the values
	initAccount() {
		return this._fb.group({
			checkbox: [false],
			purchase_ref_id: [this.invoice.purchase_id, [Validators.required]],
			receivedamount: ['', [Validators.required, Validators.max(this.invoice.invoice_amt), Validators.min(0)]],
			receiveddate: ['', Validators.required],
			pymtmode: ['', Validators.required],
			bankref: [''],
			pymtref: [''],
		});
	}

	get accountarr(): FormGroup {
		return this.submitForm.get('accountarr') as FormGroup;
	}

	addAccount() {
		const control = <FormArray>this.submitForm.controls['accountarr'];
		control.push(this.initAccount());

		this._cdr.markForCheck();
	}

	ngAfterViewInit() {
		this.getBalanceDue();
	}

	// method to calculate total payed now and balance due
	checkTotalSum() {
		this.summed = 0;
		const ctrl = <FormArray>this.submitForm.controls['accountarr'];
		// iterate each object in the form array
		ctrl.controls.forEach((x) => {
			// get the itemmt value and need to parse the input to number

			let parsed = parseFloat(x.get('receivedamount').value === '' || x.get('receivedamount').value === null ? 0 : x.get('receivedamount').value);
			// add to total

			this.summed += parsed;
			this.getBalanceDue();

			// current set of paymnets + already paid amount > actual invocie amount then error
			if (this.summed + this.invoice.paid_amount > this.invoice.invoice_amt) {
				let val = this.currencyPipe.transform(this.summed + this.invoice.paid_amount - this.invoice.invoice_amt, 'INR');
				this.errmsg = `Total payment exceeds invoice amount ` + val;
				this._cdr.detectChanges();
				return false;
			} else {
				this.errmsg = ``;
				this._cdr.detectChanges();
			}
		});
		return true;
	}

	reloadBankDetails() {
		this._commonApiService.getBanks(this.userdata.center_id).subscribe((data: any) => {
			this.bankList = data.result;

			this._cdr.markForCheck();
		});
	}

	getBalanceDue() {
		this.balancedue = this.invoice.invoice_amt - (this.invoice.paid_amount + this.summed);
	}

	onSubmit() {
		if (this.checkTotalSum()) {
			let form = {
				centerid: this.userdata.center_id,
				bankref: this.submitForm.value.accountarr[0].bankref,
				vendorid: this.submitForm.value.vendor.id,
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

	finalSubmit() {
		if (this.checkTotalSum()) {
			this._commonApiService.addVendorPymtReceived(this.submitForm.value).subscribe((data: any) => {
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

	close() {
		this.dialogRef.close();
	}

	cancel() {
		this.iswarning = false;
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
