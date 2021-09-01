import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Inject,
	OnInit,
	ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import {
	FormGroup,
	FormControl,
	Validators,
	FormBuilder,
} from '@angular/forms';
import * as xlsx from 'xlsx';
import {
	filter,
	map,
	startWith,
	tap,
	debounceTime,
	switchMap,
} from 'rxjs/operators';

import { User } from '../../models/User';
import { Vendor } from 'src/app/models/Vendor';

@Component({
	selector: 'app-vendor-statement-reports',
	templateUrl: './vendor-statement-reports.page.html',
	styleUrls: ['./vendor-statement-reports.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorStatementReportsPage implements OnInit {
	statementdata: any;

	openingbalance: any;
	closingbalance: any;
	statementForm: FormGroup;

	startdate = new Date();
	enddate = new Date();
	minDate = new Date();
	maxDate = new Date();

	filteredVendor: Observable<any[]>;
	vendor_lis: Vendor[];

	userdata$: Observable<User>;
	userdata: any;
	ready = 0; // flag check - centerid (localstorage) & vendorid (param)

	@ViewChild('epltable', { static: false }) epltable: ElementRef;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _snackBar: MatSnackBar,
		private _fb: FormBuilder,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,

		private _commonApiService: CommonApiService
	) {
		this.init();
		this.userdata$ = this._authservice.currentUser;
		this.userdata$
			.pipe(filter((data) => data !== null))
			.subscribe((data: any) => {
				// this._authservice.setCurrentMenu('SALE');
				this.userdata = data;

				this.statementForm.patchValue({
					center_id: data.center_id,
				});
				this.getVendors(this.userdata.center_id);
				this.ready = 1;

				this._cdr.markForCheck();
			});
	}

	ngOnInit() {}

	startDateSelected($event) {
		this.startdate = $event.target.value;
	}

	endDateSelected($event) {
		this.enddate = $event.target.value;
	}

	getVendors(center_id) {
		this._commonApiService
			.getAllActiveVendors(center_id)
			.subscribe((data: any) => {
				this.vendor_lis = data;

				this.filteredVendor = this.statementForm.controls[
					'vendorctrl'
				].valueChanges.pipe(
					startWith(''),
					map((vendor) =>
						vendor ? this.filtervendor(vendor) : this.vendor_lis.slice()
					)
				);
			});
	}

	async init() {
		const dateOffset = 24 * 60 * 60 * 1000 * 30;
		this.startdate.setTime(this.minDate.getTime() - dateOffset);

		this.statementForm = this._fb.group({
			startdate: [this.startdate, Validators.required],
			enddate: [this.enddate, Validators.required],
			vendorid: ['all'],
			vendorctrl: new FormControl({
				value: 'Select Vendor',
				disabled: false,
			}),
			searchtype: ['all'],
		});
	}

	filtervendor(value: any) {
		if (typeof value == 'object') {
			return this.vendor_lis.filter(
				(vendor) =>
					vendor.name.toLowerCase().indexOf(value.name.toLowerCase()) === 0
			);
		} else if (typeof value == 'string') {
			return this.vendor_lis.filter(
				(vendor) => vendor.name.toLowerCase().indexOf(value.toLowerCase()) === 0
			);
		}
	}

	getPosts(event) {
		this.statementForm.patchValue({
			vendorid: event.option.value.id,
			vendorctrl: event.option.value.name,
		});

		this._cdr.markForCheck();
	}

	getStatement() {
		let data = {
			centerid: this.userdata.center_id,
			vendorid: this.statementForm.value.vendorid,
			startdate: this.statementForm.value.startdate,
			enddate: this.statementForm.value.enddate,
		};

		if (this.statementForm.value.vendorid === 'all') {
			this.openSnackBar('Select a Vendor', '');
			return false;
		}

		this._commonApiService.getVendorStatement(data).subscribe((data: any) => {
			this.statementdata = data.body;

			if (this.statementdata[0].txn_type === 'purchase') {
				this.openingbalance =
					this.statementdata[0].balance_amt - this.statementdata[0].credit_amt;
			} else if (this.statementdata[0].txn_type === 'Payment') {
				this.openingbalance =
					this.statementdata[0].balance_amt - this.statementdata[0].debit_amt;
			}

			this.closingbalance = this.statementdata[
				this.statementdata.length - 1
			].balance_amt;

			this._cdr.markForCheck();
		});
	}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', 'mat-primary'],
		});
	}

	clearInput() {
		this.statementForm.patchValue({
			vendorid: 'all',
			vendorctrl: 'All Vendors',
		});
		this._cdr.markForCheck();
	}

	exportToExcel() {
		const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(
			this.epltable.nativeElement
		);
		ws['!cols'] = [];
		ws['!cols'][1] = { hidden: true };
		const wb: xlsx.WorkBook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
		xlsx.writeFile(wb, 'epltable.xlsx');
	}
}
