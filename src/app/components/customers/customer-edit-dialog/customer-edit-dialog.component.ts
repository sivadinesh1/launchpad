import { Component, OnInit, ChangeDetectorRef, ViewChild, Inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from '../../../services/common-api.service';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { patternValidator } from 'src/app/util/validators/pattern-validator';
import { GSTN_REGEX, country, PINCODE_REGEX, EMAIL_REGEX } from 'src/app/util/helper/patterns';
import { PhoneValidator } from 'src/app/util/validators/phone.validator';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Customer } from 'src/app/models/Customer';
import { LoadingService } from '../../loading/loading.service';

@Component({
	selector: 'app-customer-edit-dialog',
	templateUrl: './customer-edit-dialog.component.html',
	styleUrls: ['./customer-edit-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [LoadingService],
})
export class CustomerEditDialogComponent implements OnInit {
	center_id: any;
	customer_id: any;
	resultList: any;
	submitForm: any;

	isLinear = true;
	customer: Customer;
	statesdata: any;
	cexists = false;
	responseMsg: any;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<CustomerEditDialogComponent>,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		private _loadingService: LoadingService,
		@Inject(MAT_DIALOG_DATA) customer: Customer,
		private _commonApiService: CommonApiService,
	) {
		const currentUser = this._authservice.currentUserValue;
		this.center_id = currentUser.center_id;

		this.customer = customer;

		this.submitForm = this._formBuilder.group({
			customer_id: [this.customer.id],
			center_id: [this.center_id],
			name: [this.customer.name, Validators.required],
			address1: [this.customer.address1],
			address2: [this.customer.address2],
			address3: [this.customer.address3],

			district: [this.customer.district],
			state_id: [this.customer.state_id, Validators.required],
			pin: [this.customer.pin, [patternValidator(PINCODE_REGEX)]],

			gst: [this.customer.gst, [patternValidator(GSTN_REGEX)]],
			phone: [this.customer.phone, Validators.compose([PhoneValidator.invalidCountryPhone(country)])],
			mobile: [this.customer.mobile, Validators.compose([Validators.required, PhoneValidator.invalidCountryPhone(country)])],
			mobile2: [this.customer.mobile2, Validators.compose([PhoneValidator.invalidCountryPhone(country)])],
			whatsapp: [this.customer.whatsapp, Validators.compose([Validators.required, PhoneValidator.invalidCountryPhone(country)])],

			email: [this.customer.email, [patternValidator(EMAIL_REGEX)]],
		});

		this._commonApiService.getStates().subscribe((data: any) => {
			this.statesdata = data;
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
		const changes = this.submitForm.value;
		this._commonApiService.updateCustomer(this.customer.id, changes).subscribe((data: any) => {
			this.dialogRef.close('success');
		});
	}

	searchCustomers() {
		this._router.navigate([`/home/view-customers`]);
	}

	addCustomer() {
		this._router.navigate([`/home/customer/add`]);
	}

	close() {
		this.dialogRef.close();
	}

	reset() {}

	isCustomerExists() {
		if (this.submitForm.value.name.length > 0) {
			this._commonApiService.isCustomerExists(this.submitForm.value.name, this.center_id).subscribe((data: any) => {
				if (data.result.length > 0) {
					if (data.result[0].id > 0) {
						this.responseMsg = 'Customer Already Exists!';
						this.cexists = true;
					}
				} else {
					this.cexists = false;
				}

				this._cdr.markForCheck();
			});
		}
	}
}
