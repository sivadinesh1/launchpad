import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, Inject, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User';

import { NullToQuotePipe } from 'src/app/util/pipes/null-quote.pipe';
import { AlertController, IonSearchbar } from '@ionic/angular';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Customer } from 'src/app/models/Customer';
import { NavigationService } from 'src/app/services/navigation.service';
import { CommonApiService } from 'src/app/services/common-api.service';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { MatSort } from '@angular/material/sort';
import { Brand } from 'src/app/models/Brand';

@Component({
	selector: 'app-brand-discounts',
	templateUrl: './brand-discounts.component.html',
	styleUrls: ['./brand-discounts.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandDiscountsComponent implements OnInit {
	center_id: any;
	vendor_id: any;
	resultList: any;
	submitForm: FormGroup;
	submitForm1: FormGroup;

	isLinear = true;
	customer_id: any;

	// only 2 type of discount
	discountType = ['NET', 'GROSS'];

	userdata$: Observable<User>;
	userdata: any;
	ready = 0; // flag check - centerid (localstorage) & customerid (param)
	selectedDiscType = 'NET'; // default
	selectedEffDiscStDate: any;

	objForm = [];
	@ViewChild('myForm', { static: true }) myForm: NgForm;
	initialValues: any;
	customerName: string;

	elements: any;
	responsemsg: any;
	responsemsg1: any;

	pageLength: any;
	isTableHasData = true;
	brandsList: any;
	selectedRowIndex: any;

	mode = 'add';
	brandname = '';

	dataRecords: any;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _fb: FormBuilder,
		private _snackBar: MatSnackBar,
		private dialogRef: MatDialogRef<BrandDiscountsComponent>,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		@Inject(MAT_DIALOG_DATA) elements: any,
		public alertController: AlertController,
		public _navigationService: NavigationService,
		private _commonApiService: CommonApiService,
	) {
		this.elements = elements[0];

		const currentUser = this._authservice.currentUserValue;
		this.center_id = currentUser.center_id;

		this.submitForm = this._fb.group({
			customer_id: [this.elements.id, Validators.required],
			center_id: [this.center_id, Validators.required],
			brand_id: [this.elements.brand_id, Validators.required],
			disctype: ['NET', Validators.required],
			effDiscStDate: [new Date(new NullToQuotePipe().transform(this.elements.startdate).replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3'))],
			gstzero: [this.elements.gstzero, Validators.required],
			gstfive: [this.elements.gstfive, Validators.required],
			gsttwelve: [this.elements.gsttwelve, Validators.required],
			gsteighteen: [this.elements.gsteighteen, Validators.required],
			gsttwentyeight: [this.elements.gsttwentyeight, Validators.required],
		});

		this.submitForm1 = this._fb.group({
			customer_id: [this.elements.id, Validators.required],
			center_id: [this.center_id, Validators.required],
			brand_id: [null, Validators.required],
			disctype: ['NET', Validators.required],
			effDiscStDate: [new Date(), Validators.required],
			gstzero: [null, Validators.required],
			gstfive: [null, Validators.required],
			gsttwelve: [null, Validators.required],
			gsteighteen: [null, Validators.required],
			gsttwentyeight: [null, Validators.required],
		});

		this.responsemsg = '';
		this.responsemsg1 = '';

		this._cdr.markForCheck();
	}

	ngOnInit() {
		this.init();
	}

	init() {
		this._commonApiService.getDiscountsByCustomerByBrand(this.center_id, this.elements.id).subscribe((data: any) => {
			this.dataRecords = data;

			this.pageLength = data.length;

			if (data.length === 0) {
				this.isTableHasData = false;
			} else {
				this.isTableHasData = true;
			}

			this._cdr.markForCheck();
		});

		this._commonApiService.getBrandsMissingDiscounts(this.center_id, 'A', this.elements.id).subscribe((data: any) => {
			this.brandsList = data;
			this._cdr.markForCheck();
		});
	}

	highlight(row) {
		this.selectedRowIndex = row.brand_id;
	}

	internalEdit(elements) {
		this.submitForm1.reset();
		this.responsemsg = '';

		this.submitForm1.patchValue({
			customer_id: elements.id,
			center_id: this.center_id,
			brand_id: elements.brand_id,
			disctype: 'NET',
		});

		// this.submitForm.controls['invoiceno'].setErrors(null);
		this.submitForm1.setErrors(null);

		this.mode = 'update';
		this.brandname = elements.brand_name;

		this.submitForm1.patchValue({
			brand_id: elements.brand_id,
			effDiscStDate: new Date(new NullToQuotePipe().transform(elements.startdate).replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),
			gstzero: elements.gstzero,
			gstfive: elements.gstfive,
			gsttwelve: elements.gsttwelve,
			gsteighteen: elements.gsteighteen,
			gsttwentyeight: elements.gsttwentyeight,
		});
		this._cdr.markForCheck();
	}

	// discount date selection
	handleDicountDateChange(event) {
		this.submitForm1.patchValue({
			effDiscStDate: event.target.value,
		});
		this._cdr.markForCheck();
	}

	submit(action) {
		if (!this.submitForm1.valid) {
			this.responsemsg = 'All Mandatory Fields';
			return false;
		} else {
			this.responsemsg = '';
		}

		if (action === 'add') {
			// update discount table, currently only one set of values.
			// FTRIMPL - date based discounts
			this._commonApiService.addDiscountsByBrand(this.submitForm1.value).subscribe((data: any) => {
				// if successfully update
				if (data.body.result === 'success') {
					this._commonApiService.getBrandsMissingDiscounts(this.center_id, 'A', this.elements.id).subscribe((data: any) => {
						this.brandsList = data;
						this._cdr.markForCheck();
					});
					this.openSnackBar('Discounts Updated, Successfully', '');
					this.dialogRef.close('success');
				}
			});
		} else if (action === 'update') {
			// update discount table, currently only one set of values.
			// FTRIMPL - date based discounts

			this._commonApiService.updateDefaultCustomerDiscount(this.submitForm1.value).subscribe((data: any) => {
				// if successfully update
				if (data.body === 1) {
					this.openSnackBar('Brand Discount Updated, Successfully', '');
					this.dialogRef.close('success');
				}
			});
		}
	}

	reset() {
		this.submitForm.reset(this.initialValues);
	}

	close() {
		this.dialogRef.close();
	}

	defaultEdit() {
		if (!this.submitForm.valid) {
			this.responsemsg1 = 'All Mandatory Fields';
			return false;
		} else {
			this.responsemsg = '';
		}

		// update discount table, currently only one set of values.

		this._commonApiService.updateDefaultCustomerDiscount(this.submitForm.value).subscribe((data: any) => {
			// if successfully update
			if (data.body === 1) {
				this.openSnackBar('Default Discounts Updated, Successfully', '');
				this.dialogRef.close(data);
			}
		});
	}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', 'mat-primary'],
		});
	}
}
