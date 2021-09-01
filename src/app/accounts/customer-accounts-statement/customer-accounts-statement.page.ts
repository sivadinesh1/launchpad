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
import * as moment from 'moment';
import { RequireMatch } from 'src/app/util/directives/requireMatch';

@Component({
	selector: 'app-customer-accounts-statement',
	templateUrl: './customer-accounts-statement.page.html',
	styleUrls: ['./customer-accounts-statement.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerAccountsStatementPage implements OnInit {
	statementdata = [];

	openingbalance = '0.0';
	closingbalance = '0.0';
	statementForm: FormGroup;

	startdate = new Date();
	enddate = new Date();
	minDate = new Date();
	maxDate = new Date();

	filteredCustomer: Observable<any[]>;
	customer_lis: Customer[];

	isloading = false;
	isOBLoaded = false;
	isCBLoaded = false;

	userdata$: Observable<User>;
	userdata: any;
	ready = 0; // flag check - centerid (localstorage) & customerid (param)

	@ViewChild('epltable', { static: false }) epltable: ElementRef;
	datafetch = false;

	allOpeningBalanceArr = [];
	allClosingBalanceArr = [];
	currentCustomer = '';
	newrow = true;

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
			this.statementForm.controls['customerctrl'].setErrors(null);
			this._cdr.markForCheck();
		});

		this._route.data.subscribe((data) => {
			this.clearInput();
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
		const dateOffset = 24 * 60 * 60 * 1000 * 90;
		this.startdate.setTime(this.minDate.getTime() - dateOffset);

		this.statementForm = this._fb.group({
			startdate: [this.startdate, Validators.required],
			enddate: [this.enddate, Validators.required],
			customerid: ['all'],
			customerctrl: ['All Customers', [RequireMatch]],
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
		this.statementForm.controls['customerctrl'].setErrors(null);
		this._cdr.markForCheck();
	}

	getStatement() {
		this.isloading = false;
		this.closingbalance = '0.00';
		this._commonApiService
			.getCustomerStatement({
				centerid: this.userdata?.center_id,
				customerid: this.statementForm.value.customerid,
				startdate: this.statementForm.value.startdate,
				enddate: this.statementForm.value.enddate,
				saletype: 'gstinvoice',
			})
			.subscribe((data: any) => {
				this.statementdata = data.body;

				if (this.statementdata.length === 0 && this.statementForm.value.customerid === 'all') {
					this.statementdata = this.customer_lis;
				} else if (this.statementdata.length > 0 && this.statementForm.value.customerid === 'all') {
					// 1. get customer ids not in statement data
					// 2. push them to the statementdata array
					// 3. sort them asc

					let missingcustomers = this.customer_lis.filter((o) => !this.statementdata.some((i) => i.id === o.id));

					var newArray = [...this.statementdata, ...missingcustomers];

					this.statementdata = [];
					this.statementdata = newArray.sort((a, b) => a.name.localeCompare(b.name));
				}

				if (this.statementForm.value.customerid !== 'all') {
					this.getOpenCloseBalance('one');
				} else {
					this.getOpenCloseBalance('all');
				}
				this.isloading = true;
				this.datafetch = true;
				this._cdr.markForCheck();
			});
	}

	getOpenCloseBalance(mode) {
		this.isOBLoaded = false;
		this.isCBLoaded = false;

		this.closingbalance = '0.0';
		this.openingbalance = '0.0';

		this._commonApiService
			.getCustomerClosingBalanceStatement({
				centerid: this.userdata.center_id,
				customerid: this.statementForm.value.customerid,
				startdate: this.statementForm.value.startdate,
				enddate: this.statementForm.value.enddate,
				saletype: 'gstinvoice',
			})
			.subscribe((data: any) => {
				if (mode === 'all') {
					this.allClosingBalanceArr = data.body;
				} else {
					if (data.body.length > 0) {
						this.closingbalance = data.body[0]?.balance || '0.0';
					}
				}
				this.isCBLoaded = true;
				this._cdr.markForCheck();
			});

		this._commonApiService
			.getCustomerOpeningBalanceStatement({
				centerid: this.userdata.center_id,
				customerid: this.statementForm.value.customerid,
				startdate: this.statementForm.value.startdate,
				enddate: this.statementForm.value.enddate,
				saletype: 'gstinvoice',
			})
			.subscribe((data: any) => {
				if (mode === 'all') {
					this.allOpeningBalanceArr = data.body;
				} else {
					if (data.body.length > 0) {
						this.openingbalance = data.body[0]?.balance || '0.0';
					}
				}

				this.isOBLoaded = true;
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
			customerctrl: 'All Customers',
		});
		this.statementdata = [];
		this.datafetch = false;
		this.isloading = false;
		this.statementForm.controls['customerctrl'].setErrors(null);
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

	reformatRefDate(reportData) {
		reportData.forEach((element) => {
			element['ref_date_f'] = moment(element['ref_date_f']).format('DD-MM-YYYY');
		});
		return reportData;
	}

	exportAllCustomerStatement() {
		const fileName = 'Customer_All_Statement_Reports.xlsx';
		let tmpcust = '';

		let count = 0;

		let reportData = JSON.parse(JSON.stringify(this.statementdata));
		reportData = this.reformatRefDate(reportData);

		reportData.slice().forEach((e, index) => {
			if (tmpcust !== e.id) {
				reportData.splice(index - count--, 0, {
					name: e.name,
					'Open/Balance': this.getCurrentCustomerOB(e),
					'Close/Balance': this.getCurrentCustomerCB(e),
				});

				tmpcust = e.id;
			}
		});

		reportData.forEach((e) => {
			e['Date'] = e['ref_date_f'];
			delete e['ref_date_f'];

			e['Customer Name'] = e['name'];
			delete e['name'];

			e['Reference'] = e['refn'];
			delete e['refn'];

			e['Type'] = e['type'];
			delete e['type'];

			e['Invoice Amount'] = e['invoice_amount'];
			delete e['invoice_amount'];

			e['Received Amount'] = e['Received_Amount'];
			delete e['Received_Amount'];

			delete e['id'];
			delete e['center_id'];

			delete e['state_id'];
			delete e['code'];
			delete e['phone'];
			delete e['mobile'];
			delete e['mobile2'];
			delete e['whatsapp'];
			delete e['isactive'];

			delete e['credit_amt'];
			delete e['balance_amt'];
			delete e['last_paid_date'];
			delete e['place'];

			delete e['address1'];
			delete e['address2'];
			delete e['district'];
			delete e['description'];
			delete e['pin'];
			delete e['gst'];
			delete e['email'];
		});

		const wb1: xlsx.WorkBook = xlsx.utils.book_new();
		//create sheet with empty json/there might be other ways to do this
		const ws1 = xlsx.utils.json_to_sheet([]);

		ws1['!cols'] = [{ width: 16 }, { width: 32 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 40 }];

		var wsrows = [
			{ hpt: 30 }, // row 1 sets to the height of 12 in points
			{ hpx: 30 }, // row 2 sets to the height of 16 in pixels
		];

		ws1['!rows'] = wsrows; // ws - worksheet

		const merge = [{ s: { c: 0, r: 0 }, e: { c: 1, r: 0 } }];

		ws1['!merges'] = merge;

		xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');
		//then add ur Title txt
		xlsx.utils.sheet_add_json(
			wb1.Sheets.sheet1,
			[
				{
					header: 'Customer Statement Reports',
					dummy1: '',
					fromdate: `From: ${moment(this.statementForm.value.startdate).format('DD/MM/YYYY')}`,
					todate: `To: ${moment(this.statementForm.value.enddate).format('DD/MM/YYYY')}`,
				},
			],
			{
				skipHeader: true,
				origin: 'A1',
			},
		);

		//start frm A2 here
		xlsx.utils.sheet_add_json(wb1.Sheets.sheet1, reportData, {
			skipHeader: false,
			origin: 'A2',
			header: ['Date', 'Customer Name', 'Type', 'Invoice Amount', 'Received Amount', 'Open/Balance', 'Close/Balance', 'Reference'],
		});
		xlsx.writeFile(wb1, fileName);
	}

	exportCustomerStatement() {
		const fileName = 'Customer_Statement_Reports.xlsx';

		let reportData = JSON.parse(JSON.stringify(this.statementdata));

		reportData = this.reformatRefDate(reportData);

		reportData.forEach((e) => {
			e['Customer Name'] = e['name'];

			e['Type'] = e['type'];
			delete e['type'];

			e['Invoice Amount'] = e['invoice_amount'];
			delete e['invoice_amount'];

			e['Received Amount'] = e['Received_Amount'];
			delete e['Received_Amount'];

			e['Reference'] = e['refn'];
			delete e['refn'];

			delete e['id'];
			delete e['name'];
			delete e['place'];
			e['Date'] = e['ref_date_f'];
			delete e['ref_date_f'];
		});

		const wb1: xlsx.WorkBook = xlsx.utils.book_new();
		//create sheet with empty json/there might be other ways to do this
		const ws1 = xlsx.utils.json_to_sheet([]);

		//var ws = XLSX.utils.json_to_sheet(data, {header:['def','abc']});

		ws1['!cols'] = [{ width: 16 }, { width: 32 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 32 }];

		var wsrows = [
			{ hpt: 30 }, // row 1 sets to the height of 12 in points
			{ hpx: 30 }, // row 2 sets to the height of 16 in pixels
		];

		ws1['!rows'] = wsrows; // ws - worksheet

		const merge = [{ s: { c: 0, r: 0 }, e: { c: 1, r: 0 } }];

		ws1['!merges'] = merge;

		xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');
		//then add ur Title txt
		xlsx.utils.sheet_add_json(
			wb1.Sheets.sheet1,
			[
				{
					header: 'Statement Reports',
					dummy1: '',
					fromdate: `From: ${moment(this.statementForm.value.startdate).format('DD/MM/YYYY')}`,
					todate: `To: ${moment(this.statementForm.value.enddate).format('DD/MM/YYYY')}`,
					openingbalance: `Open/Bal: ${this.openingbalance}`,
					closingbalance: `Close/Bal: ${this.closingbalance}`,
				},
			],
			{
				skipHeader: true,
				origin: 'A1',
			},
		);
		//start frm A2 here
		xlsx.utils.sheet_add_json(wb1.Sheets.sheet1, reportData, {
			skipHeader: false,
			origin: 'A2',
			header: ['Date', 'Customer Name', 'Type', 'Invoice Amount', 'Received Amount', 'Reference'],
		});
		xlsx.writeFile(wb1, fileName);
	}

	check(item) {
		if (this.currentCustomer === item.name) {
			this.newrow = false;
		} else {
			this.currentCustomer = item.name;
			this.newrow = true;
		}
		this._cdr.markForCheck();
		return;
	}

	getCurrentCustomerCB(item) {
		let tempCB = this.allClosingBalanceArr.filter((data: any) => data.id === item.id);
		return tempCB[0]?.balance || 0;
	}

	getCurrentCustomerOB(item) {
		let tempCB = this.allOpeningBalanceArr.filter((data: any) => data.id === item.id);
		return tempCB[0]?.balance || 0;
	}
}
