import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Customer } from 'src/app/models/Customer';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import * as xlsx from 'xlsx';
import { filter, map, startWith, tap, debounceTime, switchMap } from 'rxjs/operators';

import { User } from '../../models/User';

@Component({
	selector: 'app-statement-reports',
	templateUrl: './statement-reports.page.html',
	styleUrls: ['./statement-reports.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementReportsPage implements OnInit {
	statementdata: any;

	openingbalance: any;
	closingbalance: any;
	statementForm: FormGroup;

	startdate = new Date();
	enddate = new Date();
	minDate = new Date();
	maxDate = new Date();

	filteredCustomer: Observable<any[]>;
	customer_lis: Customer[];

	userdata$: Observable<User>;
	userdata: any;
	ready = 0; // flag check - centerid (localstorage) & customerid (param)

	@ViewChild('epltable', { static: false }) epltable: ElementRef;
	datafetch = false;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _snackBar: MatSnackBar,
		private _fb: FormBuilder,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,

		private _commonApiService: CommonApiService,
	) {
		this.init();
		this.userdata$ = this._authservice.currentUser;
		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			// this._authservice.setCurrentMenu('SALE');
			this.userdata = data;

			this.statementForm.patchValue({
				center_id: data.center_id,
			});
			this.getCustomers(this.userdata.center_id);
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

	getCustomers(center_id) {
		this._commonApiService.getAllActiveCustomers(center_id).subscribe((data: any) => {
			this.customer_lis = data;

			this.filteredCustomer = this.statementForm.controls['customerctrl'].valueChanges.pipe(
				startWith(''),
				map((customer) => (customer ? this.filtercustomer(customer) : this.customer_lis.slice())),
			);
		});
	}

	async init() {
		const dateOffset = 24 * 60 * 60 * 1000 * 30;
		this.startdate.setTime(this.minDate.getTime() - dateOffset);

		this.statementForm = this._fb.group({
			startdate: [this.startdate, Validators.required],
			enddate: [this.enddate, Validators.required],
			customerid: ['all'],
			customerctrl: new FormControl({
				value: 'All Customers',
				disabled: false,
			}),
			searchtype: ['all'],
		});
	}

	filtercustomer(value: any) {
		if (typeof value == 'object') {
			return this.customer_lis.filter((customer) => customer.name.toLowerCase().match(value.name.toLowerCase()));
		} else if (typeof value == 'string') {
			return this.customer_lis.filter((customer) => customer.name.toLowerCase().match(value.toLowerCase()));
		}
	}

	getPosts(event) {
		this.statementForm.patchValue({
			customerid: event.option.value.id,
			customerctrl: event.option.value.name,
		});
		this.statementdata = [];
		this.datafetch = false;
		this._cdr.markForCheck();
	}

	getStatement() {
		let data = {
			centerid: this.userdata.center_id,
			customerid: this.statementForm.value.customerid,
			startdate: this.statementForm.value.startdate,
			enddate: this.statementForm.value.enddate,
		};

		// if (this.statementForm.value.customerid === 'all') {
		// 	this.openSnackBar('Select a Customer', '');
		// 	return false;
		// }

		this._commonApiService.getCustomerStatement(data).subscribe((data: any) => {
			this.statementdata = data.body;
			this.datafetch = true;

			if (this.statementForm.value.customerid !== 'all') {
				this.openingbalance = this.statementdata[0]?.balance_amt;
			}

			if (this.statementForm.value.customerid !== 'all') {
				this.closingbalance = this.statementdata[this.statementdata.length - 1]?.balance_amt;
			}

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
			customerid: 'all',
			customerctrl: '',
		});
		this.statementdata = [];
		this.datafetch = false;
		this._cdr.markForCheck();
	}

	exportToExcel() {
		const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(this.epltable.nativeElement);
		ws['!cols'] = [];
		// ws['!cols'][1] = { hidden: true };
		const wb: xlsx.WorkBook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
		xlsx.writeFile(wb, 'epltable.xlsx');
	}
}
