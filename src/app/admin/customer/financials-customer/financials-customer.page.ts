import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from 'src/app/models/Customer';
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
import { CustomerPaymentDialogComponent } from 'src/app/components/customers/customer-payment-dialog/customer-payment-dialog.component';
import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ShowStatementComponent } from 'src/app/components/reports/show-statement/show-statement.component';

@Component({
	selector: 'app-financials-customer',
	templateUrl: './financials-customer.page.html',
	styleUrls: ['./financials-customer.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialsCustomerPage implements OnInit {
	center_id: any;
	customer_id: any;

	// customer$: Observable<Customer[]>;
	userdata$: Observable<User>;
	userdata: any;
	isTableHasData = true;

	ready = 0;
	pcount: any;
	noMatch: any;
	responseMsg: string;

	resultsize = 0;
	customerslist: any;
	customersOriglist: any;

	customerdata: any;
	totalOutstandingBalance = 0;

	customer_credit_amount = 0;

	submitForm: FormGroup;
	statementForm: FormGroup;

	fromdate = new Date();
	todate = new Date();
	minDate = new Date();
	maxDate = new Date();

	startdate = new Date();
	enddate = new Date();
	pageLength = 0;

	searchType = [
		{ name: 'All', id: 'all', checked: true },
		{ name: 'Invoice Only', id: 'invonly', checked: false },
	];

	@ViewChild('searchbartab1', { static: true }) searchbartab1: IonSearchbar;
	@ViewChild('searchbartab2', { static: true }) searchbartab2: IonSearchbar;
	@ViewChild('searchbartab3', { static: true }) searchbartab3: IonSearchbar;

	@ViewChild('InvoiceTablePaginator') invoiceTablePaginator: MatPaginator;

	@ViewChild('PaymentTablePaginator') pymtTablePaginator: MatPaginator;
	@ViewChild('PaymentOverviewTablePaginator') pymtOverviewTablePaginator: MatPaginator;

	@ViewChild('PymtTransactionTablePaginator')
	pymttransactionTablePaginator: MatPaginator;

	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// @ViewChild('epltable', { static: false }) epltable: ElementRef;

	// @ViewChild('epltable0', { static: false }) epltable0: ElementRef;

	// @ViewChild('epltable1', { static: false }) epltable1: ElementRef;

	// table display columns
	displayedColumns: string[] = ['ledgerdate', 'ledgerrefid', 'type', 'creditamt', 'debitamt', 'balamt'];
	saleInvoiceDisplayedColumns: string[] = ['invoicedate', 'invoiceno', 'nettotal', 'paymentstatus', 'paidamt', 'balamt', 'paybtn'];

	paymentDisplayedColumns: string[] = [
		'pymtdate',
		'paymentno',
		'invoiceno',
		'invoicedate',
		'pymtmode',
		'pymtbank',
		'bankref',
		'pymtref',
		'invoiceamt',
		'nowpaid',
		'paidamt',
	];

	paymentOverviewDisplayedColumns: string[] = ['pymtdate', 'paidamt', 'paymentno', 'pymtmode', 'pymtbank', 'bankref', 'pymtref'];

	pymtTxnDisplayedColumns: string[] = ['pymtdate', 'pymtno', 'paidamt', 'paymode', 'payref'];

	// data sources
	saleInvoicedataSource = new MatTableDataSource<any>();

	paymentdataSource = new MatTableDataSource<any>();
	paymentOverviewdataSource = new MatTableDataSource<any>();

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
			// this.reloadCustomerLedger();
			// this.reloadSaleInvoiceByCustomer();
			// this.reloadPaymentsByCustomer();
			this.init();

			this._cdr.markForCheck();
		});

		const dateOffset = 24 * 60 * 60 * 1000 * 180;
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
			customerid: [],
		});

		this._route.data.subscribe((data) => {
			this.customerdata = data['customerdata'][0];
			this.customer_id = this.customerdata.id;
			this.customer_credit_amount = this.customerdata?.credit_amt;
		});

		this._route.params.subscribe((params) => {
			this.center_id = params['center_id'];
			this.customer_id = params['customer_id'];
			this.initForm();
			this.initStatementForm();
			this.init();
			this._cdr.markForCheck();
		});
	}

	async init() {
		this.tabIndex = 0;
		if (this.ready === 1 && this.customer_id !== undefined) {
			this.reloadSaleInvoiceByCustomer();
			this.reloadPaymentsOverviewByCustomer();
			this.reloadPaymentsByCustomer();

			this.updateCustomerCreditBalance();
		}
		this._cdr.markForCheck();
	}

	initForm() {
		const dateOffset = 24 * 60 * 60 * 1000 * 180;
		this.fromdate.setTime(this.minDate.getTime() - dateOffset);

		this.submitForm.patchValue({
			customerid: 'all',

			todate: this.todate,
			fromdate: this.fromdate,
			invoiceno: '',
			searchtype: 'all',
		});

		this._cdr.detectChanges();
	}

	initStatementForm() {
		const dateOffset = 24 * 60 * 60 * 1000 * 180;
		this.startdate.setTime(this.minDate.getTime() - dateOffset);

		this.submitForm.patchValue({
			startdate: this.startdate,
			enddate: this.enddate,
			customerid: this.customer_id,
		});

		this._cdr.detectChanges();
	}

	ngOnInit() {}

	ngAfterViewInit() {
		this.saleInvoicedataSource.paginator = this.invoiceTablePaginator;
		this.paymentdataSource.paginator = this.pymtTablePaginator;
		this.paymentOverviewdataSource.paginator = this.pymtOverviewTablePaginator;
		this._cdr.markForCheck();
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
		this.paymentdataSource.filter = filterValue;

		if (this.paymentdataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	applyFilter2(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.paymentOverviewdataSource.filter = filterValue;

		if (this.paymentOverviewdataSource.filteredData.length > 0) {
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

		this.saleInvoicedataSource.filter = filterValue;

		if (this.saleInvoicedataSource.filteredData.length > 0) {
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
			this.reloadSaleInvoiceByCustomer();
		} else if ($event.index === 1) {
			this.reloadPaymentsOverviewByCustomer();
		} else if ($event.index === 2) {
			this.reloadPaymentsByCustomer();
		}

		this._cdr.markForCheck();
	}

	reloadSaleInvoiceByCustomer() {
		let center_id = this.center_id;
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;

		let searchtype = this.submitForm.value.searchtype;
		let invoiceno = this.submitForm.value.invoiceno;

		this._commonApiService
			.getSaleInvoiceByCustomer({
				centerid: center_id,
				customerid: this.customer_id,
				fromdate: fromdate,
				todate: todate,

				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.saleInvoicedataSource.data = data.body;
				this.saleInvoicedataSource.sort = this.sort;
				this.pageLength = data.body.length;

				this._cdr.markForCheck();
			});
	}

	reloadPaymentsByCustomer() {
		let center_id = this.center_id;
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;

		let searchtype = this.submitForm.value.searchtype;
		let invoiceno = this.submitForm.value.invoiceno;
		this._commonApiService
			.getPaymentsByCustomer({
				centerid: center_id,
				customerid: this.customer_id,
				fromdate: fromdate,
				todate: todate,

				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.paymentdataSource.data = data.body;

				this.paymentdataSource.sort = this.sort;

				this._cdr.markForCheck();
			});
	}

	reloadPaymentsOverviewByCustomer() {
		let center_id = this.center_id;
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;

		this._commonApiService
			.getPaymentsOverviewByCustomer({
				centerid: center_id,
				customerid: this.customer_id,
				fromdate: fromdate,
				todate: todate,

				searchtype: 'all',
			})
			.subscribe((data: any) => {
				this.paymentOverviewdataSource.data = data.body;

				this.paymentOverviewdataSource.sort = this.sort;

				this._cdr.markForCheck();
			});
	}

	viewAllCustomers() {
		this._router.navigate([`/home/view-customers`]);
	}

	addPayments(element) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '80%';
		dialogConfig.height = '80%';
		dialogConfig.data = {
			customerdata: this.customerdata,
			invoicedata: element,
		};

		const dialogRef = this._dialog.open(CustomerPaymentDialogComponent, dialogConfig);

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
					dialogConfigSuccess.data = 'Receivables added succesfully';

					const dialogRef = this._dialog.open(SuccessMessageDialogComponent, dialogConfigSuccess);
				}
			});
	}

	updateCustomerCreditBalance() {
		this._commonApiService.getCustomerDetails(this.center_id, this.customer_id).subscribe((data: any) => {
			this.customer_credit_amount = data?.credit_amt;
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
			customerid: this.customer_id,
			startdate: this.statementForm.value.startdate,
			enddate: this.statementForm.value.enddate,
			saletype: 'gstinvoice',
		};

		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(ShowStatementComponent, dialogConfig);

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
		});
	}
}
