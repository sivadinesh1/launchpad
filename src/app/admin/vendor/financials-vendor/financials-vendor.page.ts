import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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
import { filter, tap } from 'rxjs/operators';

import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ShowStatementComponent } from 'src/app/components/reports/show-statement/show-statement.component';
import { VendorPaymentDialogComponent } from 'src/app/components/vendors/vendor-payment-dialog/vendor-payment-dialog.component';
import { ShowVendorStatementComponent } from 'src/app/components/reports/show-vendor-statement/show-vendor-statement.component';

@Component({
	selector: 'app-financials-vendor',
	templateUrl: './financials-vendor.page.html',
	styleUrls: ['./financials-vendor.page.scss'],
})
export class FinancialsVendorPage implements OnInit {
	center_id: any;
	vendor_id: any;

	userdata$: Observable<User>;
	userdata: any;
	isTableHasData = true;

	ready = 0;
	pcount: any;
	noMatch: any;
	responseMsg: string;
	pageLength: any;

	resultsize = 0;
	vendorslist: any;
	vendorsOriglist: any;

	vendordata: any;
	totalOutstandingBalance = 0;

	vendor_credit_amount = 0;

	submitForm: FormGroup;
	statementForm: FormGroup;

	fromdate = new Date();
	todate = new Date();
	minDate = new Date();
	maxDate = new Date();

	startdate = new Date();
	enddate = new Date();

	searchType = [
		{ name: 'All', id: 'all', checked: true },
		{ name: 'Invoice Only', id: 'invonly', checked: false },
	];

	@ViewChild('searchbartab1', { static: true }) searchbartab1: IonSearchbar;
	@ViewChild('searchbartab2', { static: true }) searchbartab2: IonSearchbar;
	@ViewChild('searchbartab3', { static: true }) searchbartab3: IonSearchbar;

	@ViewChild('InvoiceTablePaginator') invoiceTablePaginator: MatPaginator;
	@ViewChild('PaymentTablePaginator') pymtTablePaginator: MatPaginator;
	@ViewChild('LedgerTablePaginator') ledgerTablePaginator: MatPaginator;

	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('epltable', { static: false }) epltable: ElementRef;

	@ViewChild('epltable0', { static: false }) epltable0: ElementRef;

	@ViewChild('epltable1', { static: false }) epltable1: ElementRef;

	// table display columns
	displayedColumns: string[] = ['ledgerdate', 'ledgerrefid', 'type', 'creditamt', 'debitamt', 'balamt'];
	purchaseInvoiceDisplayedColumns: string[] = ['invoicedate', 'invoiceno', 'nettotal', 'paymentstatus', 'paidamt', 'balamt', 'paybtn'];

	paymentDisplayedColumns: string[] = [
		'pymtdate',
		'paymentno',
		'invoiceno',
		'invoicedate',
		'pymtmode',
		'bankref',
		'pymtref',
		'invoiceamt',
		'nowpaid',
		'paidamt',
	];

	// data sources
	ledgerdataSource = new MatTableDataSource<any>();
	purchaseInvoicedataSource = new MatTableDataSource<any>();

	paymentdataSource = new MatTableDataSource<any>();

	pymttransactionsdataSource = new MatTableDataSource<any>();

	tabIndex = 0;

	constructor(
		private _authservice: AuthenticationService,
		private _cdr: ChangeDetectorRef,
		private _dialog: MatDialog,
		private _commonApiService: CommonApiService,
		private _route: ActivatedRoute,
		private _router: Router,
		private _fb: FormBuilder,
	) {
		this.userdata$ = this._authservice.currentUser;

		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this.center_id = data.center_id;
			this.ready = 1;

			this.init();

			this._cdr.markForCheck();
		});

		const dateOffset = 24 * 60 * 60 * 1000 * 365;
		this.fromdate.setTime(this.minDate.getTime() - dateOffset);

		this.startdate.setTime(this.minDate.getTime() - dateOffset);

		this.userdata$ = this._authservice.currentUser;

		this.submitForm = this._fb.group({
			todate: [this.todate, Validators.required],
			fromdate: [this.fromdate, Validators.required],
			invoiceno: new FormControl({
				value: '',
				disabled: true,
			}),
			searchtype: new FormControl('all'),
		});

		this.statementForm = this._fb.group({
			startdate: [this.startdate, Validators.required],
			enddate: [this.enddate, Validators.required],
			vendorid: [],
		});

		this._route.data.subscribe((data) => {
			this.vendordata = data['vendordata'][0];
			this.vendor_id = this.vendordata.id;
			this.vendor_credit_amount = this.vendordata.credit_amt;
		});

		this._route.params.subscribe((params) => {
			this.center_id = params['center_id'];
			this.vendor_id = params['vendor_id'];
			this.initForm();
			this.initStatementForm();
			this.init();
			this._cdr.markForCheck();
		});
	}

	init() {
		if (this.ready === 1 && this.vendor_id !== undefined) {
			this.reloadPurchaseInvoiceByVendor();
			this.reloadVendorLedger();
			this.reloadPaymentsByVendor();

			this.updateVendorCreditBalance();
		}
	}

	initForm() {
		const dateOffset = 24 * 60 * 60 * 1000 * 365;
		this.fromdate.setTime(this.minDate.getTime() - dateOffset);

		this.submitForm.patchValue({
			vendorid: 'all',

			todate: this.todate,
			fromdate: this.fromdate,
			invoiceno: '',
			searchtype: 'all',
		});

		this._cdr.detectChanges();
	}

	initStatementForm() {
		const dateOffset = 24 * 60 * 60 * 1000 * 365;
		this.startdate.setTime(this.minDate.getTime() - dateOffset);

		this.submitForm.patchValue({
			startdate: this.startdate,
			enddate: this.enddate,
			vendorid: this.vendor_id,
		});

		this._cdr.detectChanges();
	}

	reloadVendorLedger() {
		this._commonApiService.getLedgerVendor(this.center_id, this.vendor_id).subscribe((data: any) => {
			this.totalOutstandingBalance = data[0]?.balance_amt | 0;

			this.ledgerdataSource.data = data;

			this.ledgerdataSource.sort = this.sort;
			this.pageLength = data.length;
			this._cdr.markForCheck();
		});
	}

	ngOnInit() {}

	ngAfterViewInit() {
		this.purchaseInvoicedataSource.data = [];
		this.purchaseInvoicedataSource.paginator = this.invoiceTablePaginator;
		this.paymentdataSource.paginator = this.pymtTablePaginator;
		this.ledgerdataSource.paginator = this.ledgerTablePaginator;
	}

	radioClickHandle() {
		if (this.submitForm.value.searchtype === 'invonly') {
		} else {
			this.submitForm.value.invoiceno = '';
			this.submitForm.patchValue({
				invoiceno: '',
				searchtype: 'all',
			});

			this.submitForm.controls['invoiceno'].setErrors(null);
			this.submitForm.controls['invoiceno'].markAsTouched();
		}
		this._cdr.detectChanges();
	}

	applyFilter3(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.ledgerdataSource.filter = filterValue;

		if (this.ledgerdataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	applyFilter2(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.paymentdataSource.filter = filterValue;

		if (this.paymentdataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	fromDateSelected($event) {
		this.fromdate = $event.target.value;
	}

	toDateSelected($event) {
		this.todate = $event.target.value;
	}

	startDateSelected($event) {
		this.startdate = $event.target.value;
	}

	endDateSelected($event) {
		this.enddate = $event.target.value;
	}

	applyFilter1(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.purchaseInvoicedataSource.filter = filterValue;

		if (this.purchaseInvoicedataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	resetTab2() {
		this.searchbartab2.value = '';
	}

	resetTab3() {
		this.searchbartab3.value = '';
	}

	resetTab1() {
		this.searchbartab1.value = '';
	}

	async tabClick($event) {
		// Ledger Tab
		if ($event.index === 0) {
			this.reloadPurchaseInvoiceByVendor();
		} else if ($event.index === 1) {
			this.reloadPaymentsByVendor();
		} else if ($event.index === 2) {
			this.reloadVendorLedger();
		}

		this._cdr.markForCheck();
	}

	reloadPurchaseInvoiceByVendor() {
		let center_id = this.center_id;
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;

		let searchtype = this.submitForm.value.searchtype;
		let invoiceno = this.submitForm.value.invoiceno;

		this._commonApiService
			.getPurhaseInvoiceByVendor({
				centerid: center_id,
				vendorid: this.vendor_id,
				fromdate: fromdate,
				todate: todate,

				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.purchaseInvoicedataSource.data = data.body;
				this._cdr.markForCheck();
			});
	}

	reloadPaymentsByVendor() {
		let center_id = this.center_id;
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;

		let searchtype = this.submitForm.value.searchtype;
		let invoiceno = this.submitForm.value.invoiceno;
		this._commonApiService
			.getPaymentsByVendor({
				centerid: center_id,
				vendorid: this.vendor_id,
				fromdate: fromdate,
				todate: todate,

				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.paymentdataSource.data = data.body;

				this._cdr.markForCheck();
			});
	}

	reloadPymtTransactionByVendor() {
		this._commonApiService.getPymtTransactionByVendor(this.center_id, this.vendor_id).subscribe((data: any) => {
			// DnD - code to add a "key/Value" in every object of array
			this.pymttransactionsdataSource.data = data.map((el) => {
				var o = Object.assign({}, el);
				o.isExpanded = false;
				return o;
			});

			this.pymttransactionsdataSource.sort = this.sort;
			this.pageLength = data.length;

			this._cdr.markForCheck();
		});
	}

	viewAllVendors() {
		this._router.navigate([`/home/view-vendors`]);
	}

	addPayments(element) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '80%';
		dialogConfig.height = '80%';
		dialogConfig.data = {
			vendordata: this.vendordata,
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
				console.log('object dinesh ');
				if (data === 'success') {
					const dialogConfigSuccess = new MatDialogConfig();
					dialogConfigSuccess.disableClose = false;
					dialogConfigSuccess.autoFocus = true;
					dialogConfigSuccess.width = '25%';
					dialogConfigSuccess.height = '25%';
					dialogConfigSuccess.data = 'Receivables add succesfully';

					const dialogRef = this._dialog.open(SuccessMessageDialogComponent, dialogConfigSuccess);
				}
			});
	}

	updateVendorCreditBalance() {
		this._commonApiService.getVendorDetails(this.center_id, this.vendor_id).subscribe((data: any) => {
			this.vendor_credit_amount = data.credit_amt;
			this._cdr.markForCheck();
		});
	}

	openDialog(): void {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '50%';
		dialogConfig.height = '100%';
		dialogConfig.data = {
			centerid: this.center_id,
			vendorid: this.vendor_id,
			startdate: this.statementForm.value.startdate,
			enddate: this.statementForm.value.enddate,
		};

		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(ShowVendorStatementComponent, dialogConfig);

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
		});
	}
}
