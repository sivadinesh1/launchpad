import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from 'src/app/models/User';
import { IonSearchbar } from '@ionic/angular';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CommonApiService } from 'src/app/services/common-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { filter, tap, map, startWith } from 'rxjs/operators';
import { Vendor } from 'src/app/models/Vendor';
import { VendorPaymentDialogComponent } from 'src/app/components/vendors/vendor-payment-dialog/vendor-payment-dialog.component';
import { AccountsPayablesComponent } from 'src/app/components/accounts/accounts-payables/accounts-payables.component';
import * as xlsx from 'xlsx';
import * as moment from 'moment';

@Component({
	selector: 'app-vpurchase-accounts-payments',
	templateUrl: './vpurchase-accounts-payments.page.html',
	styleUrls: ['./vpurchase-accounts-payments.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VpurchaseAccountsPaymentsPage implements OnInit {
	center_id: any;
	vendor_id: any;

	userdata$: Observable<User>;
	vendor$: Observable<Vendor[]>;
	selectedVend = 'all';

	userdata: any;
	isTableHasData = true;

	ready = 0;
	pcount: any;
	noMatch: any;
	responseMsg: string;
	pageLength: any;
	clearedPayments: any;

	filteredVendor: Observable<any[]>;
	vendor_lis: Vendor[];

	searchType = [
		{ name: 'All', id: 'all', checked: true },
		{ name: 'Invoice Only', id: 'invonly', checked: false },
	];

	@ViewChild('searchbartab2', { static: true }) searchbartab2: IonSearchbar;
	@ViewChild('searchbartab1', { static: true }) searchbartab1: IonSearchbar;

	@ViewChild('InvoiceTablePaginator') invoiceTablePaginator: MatPaginator;
	@ViewChild('PaymentTablePaginator') pymtTablePaginator: MatPaginator;
	@ViewChild('PymtTransactionTablePaginator')
	pymttransactionTablePaginator: MatPaginator;

	@ViewChild(MatSort, { static: true }) sort: MatSort;

	@ViewChild('epltable1', { static: false }) epltable1: ElementRef;

	// table display columns
	purchaseInvoiceDisplayedColumns: string[] = ['invoicedate', 'invoiceno', 'vendorname', 'nettotal', 'paymentstatus', 'paidamt', 'balamt', 'paybtn'];
	paymentDisplayedColumns: string[] = [
		'vendorname',
		'pymtdate',
		'paymentno',
		'invoiceno',
		'invoicedate',
		'pymtmodename',
		'bankref',
		'pymtref',
		'paidamt',
	];

	// data sources
	paymentdataSource = new MatTableDataSource<any>();
	// pymttransactionsdataSource = new MatTableDataSource<any>();
	purchaseInvoicedataSource = new MatTableDataSource<any>();

	tabIndex = 0;
	invoicesdata: any;
	submitForm: FormGroup;

	fromdate = new Date();
	todate = new Date();
	minDate = new Date();
	maxDate = new Date();

	constructor(
		private _authservice: AuthenticationService,
		private _cdr: ChangeDetectorRef,
		private _dialog: MatDialog,
		private _commonApiService: CommonApiService,
		private _route: ActivatedRoute,
		private _router: Router,
		private _fb: FormBuilder,
	) {
		const dateOffset = 24 * 60 * 60 * 1000 * 365;
		this.fromdate.setTime(this.minDate.getTime() - dateOffset);
		this.userdata$ = this._authservice.currentUser;

		this.submitForm = this._fb.group({
			vendorid: ['all'],
			vendorctrl: new FormControl({
				value: 'All Vendors',
				disabled: false,
			}),
			todate: [this.todate, Validators.required],
			fromdate: [this.fromdate, Validators.required],
			invoiceno: [''],
			searchtype: new FormControl('all'),
		});

		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this._authservice.setCurrentMenu('PAYMENTS');
			this.userdata = data;
			this.ready = 1;
			this.init();

			this._cdr.markForCheck();
		});

		this._route.params.subscribe((params) => {
			if (this.userdata !== undefined) {
				this.tabIndex = 0;
				this.init();
				this.initForm();
			}
		});
	}

	initForm() {
		const dateOffset = 24 * 60 * 60 * 1000 * 365;
		this.fromdate.setTime(this.minDate.getTime() - dateOffset);

		this.submitForm.patchValue({
			vendorid: 'all',
			vendorctrl: 'All Vendors',
			todate: this.todate,
			fromdate: this.fromdate,
			invoiceno: '',
			searchtype: 'all',
		});
		this.submitForm.get('vendorctrl').enable();
		this._cdr.detectChanges();
	}

	filtervendor(value: any) {
		if (typeof value == 'object') {
			return this.vendor_lis.filter((vendor) => vendor.name.toLowerCase().indexOf(value.name.toLowerCase()) === 0);
		} else if (typeof value == 'string') {
			return this.vendor_lis.filter((vendor) => vendor.name.toLowerCase().indexOf(value.toLowerCase()) === 0);
		}
	}

	async init() {
		if (this.ready === 1) {
			this.reloadPurchaseInvoiceByCenter();
		}

		this._commonApiService.getAllActiveVendors(this.userdata.center_id).subscribe((data: any) => {
			this.vendor_lis = data;

			this.filteredVendor = this.submitForm.controls['vendorctrl'].valueChanges.pipe(
				startWith(''),
				map((vendor) => (vendor ? this.filtervendor(vendor) : this.vendor_lis.slice())),
			);

			this._cdr.markForCheck();
		});
	}

	getPosts(event) {
		this.submitForm.patchValue({
			vendorid: event.option.value.id,
			vendorctrl: event.option.value.name,
		});

		this._cdr.markForCheck();
	}

	ngOnInit() {
		this.tabIndex = 0;
	}

	ngAfterViewInit() {
		this.purchaseInvoicedataSource.paginator = this.invoiceTablePaginator;
		this.paymentdataSource.paginator = this.pymtTablePaginator;
		// this.pymttransactionsdataSource.paginator = this.pymttransactionTablePaginator;
	}

	fromDateSelected($event) {
		this.fromdate = $event.target.value;
	}

	toDateSelected($event) {
		this.todate = $event.target.value;
	}

	async tabClick($event) {
		if ($event.index === 0) {
			const dateOffset = 24 * 60 * 60 * 1000 * 365;
			this.fromdate.setTime(this.minDate.getTime() - dateOffset);
			this.initForm();
			this.reloadPurchaseInvoiceByCenter();
		} else if ($event.index === 1) {
			const dateOffset = 24 * 60 * 60 * 1000 * 365;
			this.fromdate.setTime(this.minDate.getTime() - dateOffset);
			this.initForm();
			this.searchReceivedPayments();
		}

		this._cdr.detectChanges();
	}

	resetTab2() {
		this.searchbartab2.value = '';
	}

	resetTab1() {
		this.searchbartab1.value = '';
	}

	applyFilter(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.paymentdataSource.filter = filterValue;

		if (this.paymentdataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	applyFilterTab1(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.purchaseInvoicedataSource.filter = filterValue;

		if (this.purchaseInvoicedataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	applyFilterTab2(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.paymentdataSource.filter = filterValue;

		if (this.paymentdataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	reloadPurchaseInvoiceByCenter() {
		let fromdate = this.submitForm?.value.fromdate;
		let todate = this.submitForm?.value.todate;
		let vendorid = this.submitForm?.value.vendorid;
		let searchtype = this.submitForm?.value.searchtype;
		let invoiceno = this.submitForm?.value.invoiceno;

		this._commonApiService
			.getPurchaseInvoiceByCenter({
				centerid: this.userdata.center_id,
				fromdate: fromdate,
				todate: todate,
				vendorid: vendorid,
				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.invoicesdata = data.body;

				this.purchaseInvoicedataSource.data = data.body.filter((data: any) => {
					return data.payment_status !== 'PAID';
				});

				this.purchaseInvoicedataSource.sort = this.sort;
				this.pageLength = data.length;

				this._cdr.markForCheck();
			});
	}

	searchPendingPayments() {
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;
		let vendorid = this.submitForm.value.vendorid;
		let searchtype = this.submitForm.value.searchtype;
		let invoiceno = this.submitForm.value.invoiceno;

		this._commonApiService
			.getPurchaseInvoiceByCenter({
				centerid: this.userdata.center_id,
				fromdate: fromdate,
				todate: todate,
				vendorid: vendorid,
				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.invoicesdata = data.body;

				this.purchaseInvoicedataSource.data = data.body.filter((data: any) => {
					return data.payment_status !== 'PAID';
				});

				this.purchaseInvoicedataSource.sort = this.sort;
				this.pageLength = data.length;

				this._cdr.markForCheck();
			});
	}

	searchReceivedPayments() {
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;
		let vendorid = this.submitForm.value.vendorid;
		let searchtype = this.submitForm.value.searchtype;
		let invoiceno = this.submitForm.value.invoiceno;

		this._commonApiService
			.getVendorPaymentsByCenter({
				centerid: this.userdata.center_id,
				fromdate: fromdate,
				todate: todate,
				vendorid: vendorid,
				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.clearedPayments = data.body;
				this.paymentdataSource.data = data.body;

				this._cdr.markForCheck();
			});
	}

	clearPendingPymtVendors() {
		this.submitForm.patchValue({
			vendorid: 'all',
			vendorctrl: 'All Vendors',
		});
		this._cdr.markForCheck();
		this.searchPendingPayments();
	}

	radioClickHandle() {
		if (this.submitForm.value.searchtype === 'invonly') {
			this.submitForm.get('vendorctrl').disable();
		} else {
			this.submitForm.value.invoiceno = '';
			this.submitForm.patchValue({
				invoiceno: '',
				searchtype: 'all',
			});

			this.submitForm.get('vendorctrl').enable();
			this.submitForm.controls['invoiceno'].setErrors(null);
			this.submitForm.controls['invoiceno'].markAsTouched();
		}
		this._cdr.detectChanges();
	}

	viewAllVendors() {
		this._router.navigate([`/home/view-vendors`]);
	}

	goVendorFinancials(vendor_id) {
		this._router.navigate([`/home/financials-vendor/${this.userdata.center_id}/${vendor_id}`]);
	}

	// can be deleted not used
	addPayments() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		dialogConfig.width = '80%';
		dialogConfig.height = '80%';
		dialogConfig.data = { invoicesdata: this.invoicesdata };

		const dialogRef = this._dialog.open(AccountsPayablesComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					this.init();
					this._cdr.markForCheck();
				}),
			)
			.subscribe();
	}

	addPaymentsBillToBill(element) {
		let success = 0;

		this._commonApiService.getVendorDetails(this.userdata.center_id, element.vendor_id).subscribe((vendordata) => {
			const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = true;
			dialogConfig.width = '80%';
			dialogConfig.height = '80%';
			dialogConfig.data = {
				vendordata: vendordata[0],
				invoicedata: element,
			};

			const dialogRef = this._dialog.open(VendorPaymentDialogComponent, dialogConfig);

			dialogRef
				.afterClosed()
				.pipe(
					filter((val) => !!val),
					tap(() => {
						this.init();

						this._cdr.markForCheck();
					}),
				)
				.subscribe((data: any) => {
					if (data === 'success') {
						const dialogConfigSuccess = new MatDialogConfig();
						dialogConfigSuccess.disableClose = false;
						dialogConfigSuccess.autoFocus = true;
						dialogConfigSuccess.width = '25%';
						dialogConfigSuccess.height = '25%';
						dialogConfigSuccess.data = 'Add Payments succesful';

						const dialogRef = this._dialog.open(SuccessMessageDialogComponent, dialogConfigSuccess);
					}
				});
		});
	}

	showVendorStatement() {
		this._router.navigate([`/home/vendor-statement-reports`]);
	}

	exportPendingPaymentsToExcel() {
		const fileName = 'Purchase_Pending_Payments_Reports.xlsx';

		let reportData = JSON.parse(JSON.stringify(this.invoicesdata));

		reportData.forEach((e) => {
			e['Vendor Name'] = e['vendor_name'];
			delete e['vendor_name'];

			e['Invoice #'] = e['invoice_no'];
			delete e['invoice_no'];

			e['Invoice Date'] = e['invoice_date'];
			delete e['invoice_date'];

			e['Invoice Amount'] = e['invoice_amt'];
			delete e['invoice_amt'];

			e['Aging Days'] = e['aging_days'];
			delete e['aging_days'];

			e['Payment Status'] = e['payment_status'];
			delete e['payment_status'];

			e['Paid Amount'] = e['paid_amount'];
			delete e['paid_amount'];

			e['Balance Amount'] = e['bal_amount'];
			delete e['bal_amount'];

			delete e['purchase_id'];
			delete e['center_id'];
			delete e['vendor_id'];
			delete e['vendor_address1'];
			delete e['vendor_address2'];
		});

		const wb1: xlsx.WorkBook = xlsx.utils.book_new();
		//create sheet with empty json/there might be other ways to do this
		const ws1 = xlsx.utils.json_to_sheet([]);
		xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');

		//then add ur Title txt
		xlsx.utils.sheet_add_json(
			wb1.Sheets.sheet1,
			[
				{
					header: 'Pending Payments Reports',
					fromdate: `From: ${moment(this.submitForm.value.fromdate).format('DD/MM/YYYY')}`,
					todate: `To: ${moment(this.submitForm.value.todate).format('DD/MM/YYYY')}`,
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
		});

		xlsx.writeFile(wb1, fileName);
	}

	exportClearedPaymentsToExcel() {
		//	this.arr = [];
		const fileName = 'Cleared_Payments_Reports.xlsx';

		//	this.arr = this.clearedPayments;
		let reportData = JSON.parse(JSON.stringify(this.clearedPayments));

		reportData.forEach((e) => {
			e['Vendor Name'] = e['vendor_name'];
			delete e['vendor_name'];

			e['Invoice #'] = e['invoice_no'];
			delete e['invoice_no'];

			e['Invoice Date'] = e['invoice_date'];
			delete e['invoice_date'];

			e['Bank Ref'] = e['bank_ref'];
			delete e['bank_ref'];

			e['Payment Ref'] = e['pymt_ref'];
			delete e['pymt_ref'];

			e['Payment #'] = e['payment_no'];
			delete e['payment_no'];

			e['Payment Date'] = e['payment_date'];
			delete e['payment_date'];

			e['Payment Mode'] = e['pymt_mode_name'];
			delete e['pymt_mode_name'];

			e['Advance Amount Used'] = e['advance_amt_used'];
			delete e['advance_amt_used'];

			e['Paid Amount'] = e['applied_amount'];
			delete e['applied_amount'];

			delete e['vendor_id'];
			delete e['last_updated'];
			delete e['pymt_mode_ref_id'];
		});

		const wb1: xlsx.WorkBook = xlsx.utils.book_new();
		//create sheet with empty json/there might be other ways to do this
		const ws1 = xlsx.utils.json_to_sheet([]);
		xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');

		//then add ur Title txt
		xlsx.utils.sheet_add_json(
			wb1.Sheets.sheet1,
			[
				{
					header: 'Pending Payments Reports',
					fromdate: `From: ${moment(this.submitForm.value.fromdate).format('DD/MM/YYYY')}`,
					todate: `To: ${moment(this.submitForm.value.todate).format('DD/MM/YYYY')}`,
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
		});

		xlsx.writeFile(wb1, fileName);
	}
}
