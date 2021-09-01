import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
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

import { CustomerPaymentDialogComponent } from 'src/app/components/customers/customer-payment-dialog/customer-payment-dialog.component';
import { AccountsReceivablesComponent } from 'src/app/components/accounts/accounts-receivables/accounts-receivables.component';
import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { filter, tap, map, startWith } from 'rxjs/operators';
import * as xlsx from 'xlsx';
import * as moment from 'moment';

@Component({
	selector: 'app-accounts-payments',
	templateUrl: './accounts-payments.page.html',
	styleUrls: ['./accounts-payments.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsPaymentsPage implements OnInit {
	center_id: any;
	customer_id: any;

	// customer$: Observable<Customer[]>;
	userdata$: Observable<User>;
	userdata: any;
	isTableHasData = true;
	arr: Array<any>;

	ready = 0;
	pcount: any;
	noMatch: any;
	responseMsg: string;
	pageLength: any;

	customerslist: any;
	customersOriglist: any;

	filteredCustomer: Observable<any[]>;
	customer_lis: Customer[];

	searchType = [
		{ name: 'All', id: 'all', checked: true },
		{ name: 'Invoice Only', id: 'invonly', checked: false },
	];

	@ViewChild('searchbartab2', { static: true }) searchbartab2: IonSearchbar;
	@ViewChild('searchbartab1', { static: true }) searchbartab1: IonSearchbar;
	@ViewChild('searchbartab3', { static: true }) searchbartab3: IonSearchbar;

	@ViewChild('InvoiceTablePaginator') invoiceTablePaginator: MatPaginator;
	@ViewChild('PaymentTablePaginator') pymtTablePaginator: MatPaginator;
	@ViewChild('PymtOverviewTablePaginator') pymtOverviewTablePaginator: MatPaginator;

	@ViewChild('PymtTransactionTablePaginator')
	pymttransactionTablePaginator: MatPaginator;

	@ViewChild(MatSort, { static: true }) sort: MatSort;

	@ViewChild('epltable1', { static: false }) epltable1: ElementRef;

	// table display columns
	saleInvoiceDisplayedColumns: string[] = ['invoicedate', 'invoiceno', 'customername', 'nettotal', 'paidamt', 'balamt', 'paybtn'];
	paymentDisplayedColumns: string[] = [
		'customername',
		'paymentno',
		'pymtdate',
		'paidamt',
		'invoiceno',
		'invoicedate',
		'invoiceamount',
		'pymtmodename',
		'pymtbank',
		'bankref',
		'pymtref',
	];

	paymentOverviewDisplayedColumns: string[] = ['customername', 'pymtdate', 'paymentno', 'paidamt', 'pymtmodename', 'pymtbank', 'bankref', 'pymtref'];

	pymtTxnDisplayedColumns: string[] = ['custname', 'pymtno', 'pymtdate', 'paidamt', 'paymode', 'bankref', 'payref'];

	// data sources
	paymentdataSource = new MatTableDataSource<any>();
	paymentOverviewdataSource = new MatTableDataSource<any>();
	pymttransactionsdataSource = new MatTableDataSource<any>();
	saleInvoicedataSource = new MatTableDataSource<any>();

	tabIndex = 0;
	invoicesdata: any;
	paymentdata: any;
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
			customerid: ['all'],
			customerctrl: new FormControl({
				value: 'All Customers',
				disabled: false,
			}),
			todate: [this.todate, Validators.required],
			fromdate: [this.fromdate, Validators.required],
			invoiceno: [''],
			searchtype: new FormControl('all'),
		});

		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this._authservice.setCurrentMenu('Receivables');
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
			customerid: 'all',
			customerctrl: 'All Customers',
			todate: this.todate,
			fromdate: this.fromdate,
			invoiceno: '',
			searchtype: 'all',
		});
		this.submitForm.get('customerctrl').enable();
		this._cdr.detectChanges();
	}

	filtercustomer(value: any) {
		if (typeof value == 'object') {
			return this.customer_lis.filter((customer) => customer.name.toLowerCase().match(value.name.toLowerCase()));
		} else if (typeof value == 'string') {
			return this.customer_lis.filter((customer) => customer.name.toLowerCase().match(value.toLowerCase()));
		}
	}

	async init() {
		if (this.ready === 1) {
			this.tabIndex = 0;
			this.reloadSaleInvoiceByCenter();
			this._cdr.markForCheck();
			// this.reloadPaymentsByCenter();
			// this.reloadPaymentsOverviewByCenter();
		}

		this._commonApiService.getAllActiveCustomers(this.userdata.center_id).subscribe((data: any) => {
			this.customer_lis = data;

			this.filteredCustomer = this.submitForm.controls['customerctrl'].valueChanges.pipe(
				startWith(''),
				map((customer) => (customer ? this.filtercustomer(customer) : this.customer_lis.slice())),
			);
		});
	}

	getPosts(event) {
		this.submitForm.patchValue({
			customerid: event.option.value.id,
			customerctrl: event.option.value.name,
		});

		this._cdr.markForCheck();
	}

	ngOnInit() {}

	ngAfterViewInit() {
		this.saleInvoicedataSource.paginator = this.invoiceTablePaginator;
		this.paymentdataSource.paginator = this.pymtTablePaginator;
		this.paymentOverviewdataSource.paginator = this.pymtOverviewTablePaginator;
		this.pymttransactionsdataSource.paginator = this.pymttransactionTablePaginator;
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
			this.reloadSaleInvoiceByCenter();
		} else if ($event.index === 1) {
			const dateOffset = 24 * 60 * 60 * 1000 * 365;
			this.fromdate.setTime(this.minDate.getTime() - dateOffset);
			this.initForm();
			this.reloadPaymentsOverviewByCenter();
		} else if ($event.index === 2) {
			const dateOffset = 24 * 60 * 60 * 1000 * 365;
			this.fromdate.setTime(this.minDate.getTime() - dateOffset);
			this.initForm();
			this.reloadPaymentsByCenter();
		}

		this._cdr.detectChanges();
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

	// applyFilter3(filterValue: string) {
	// 	filterValue = filterValue.trim(); // Remove whitespace
	// 	filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
	// 	this.pymttransactionsdataSource.filter = filterValue;

	// 	if (this.pymttransactionsdataSource.filteredData.length > 0) {
	// 		this.isTableHasData = true;
	// 	} else {
	// 		this.isTableHasData = false;
	// 	}
	// }

	applyFilterTab1(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.saleInvoicedataSource.filter = filterValue;

		if (this.saleInvoicedataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	applyFilterTab2(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.paymentOverviewdataSource.filter = filterValue;

		if (this.paymentOverviewdataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	applyFilterTab3(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.paymentdataSource.filter = filterValue;

		if (this.paymentdataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	reloadPaymentsOverviewByCenter() {
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;

		this._commonApiService
			.getPaymentsOverviewByCenter({
				centerid: this.userdata.center_id,
				fromdate: fromdate,
				todate: todate,
				customerid: 'all',
				searchtype: 'all',
			})
			.subscribe((data: any) => {
				this.paymentdata = data.body;

				// DnD - code to add a "key/Value" in every object of array
				this.paymentOverviewdataSource.data = data.body;

				this.paymentOverviewdataSource.sort = this.sort;

				this.pageLength = data.body.length;

				this._cdr.markForCheck();
			});
	}

	reloadPaymentsByCenter() {
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;
		let customerid = this.submitForm.value.customerid;
		let searchtype = this.submitForm.value.searchtype;
		let invoiceno = this.submitForm.value.invoiceno;

		this._commonApiService
			.getPaymentsByCenter({
				centerid: this.userdata.center_id,
				fromdate: fromdate,
				todate: todate,
				customerid: customerid,
				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.paymentdata = data.body;
				// DnD - code to add a "key/Value" in every object of array
				this.paymentdataSource.data = data.body.map((el) => {
					var o = Object.assign({}, el);
					o.isExpanded = false;
					return o;
				});

				this.paymentdataSource.sort = this.sort;

				this._cdr.markForCheck();
			});
	}

	reloadSaleInvoiceByCenter() {
		let fromdate = this.submitForm?.value.fromdate;
		let todate = this.submitForm?.value.todate;
		let customerid = this.submitForm?.value.customerid;
		let searchtype = this.submitForm?.value.searchtype;
		let invoiceno = this.submitForm?.value.invoiceno;

		this._commonApiService
			.getSaleInvoiceByCenter({
				centerid: this.userdata.center_id,
				fromdate: fromdate,
				todate: todate,
				customerid: customerid,
				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.invoicesdata = data.body;

				this.saleInvoicedataSource.data = data.body.filter((data: any) => {
					return data.payment_status !== 'PAID';
				});

				this.saleInvoicedataSource.sort = this.sort;

				this._cdr.markForCheck();
			});
	}

	searchPendingPayments() {
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;
		let customerid = this.submitForm.value.customerid;
		let searchtype = this.submitForm.value.searchtype;
		let invoiceno = this.submitForm.value.invoiceno;

		this._commonApiService
			.getSaleInvoiceByCenter({
				centerid: this.userdata.center_id,
				fromdate: fromdate,
				todate: todate,
				customerid: customerid,
				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.invoicesdata = data.body;

				this.saleInvoicedataSource.data = data.body.filter((data: any) => {
					return data.payment_status !== 'PAID';
				});

				this.saleInvoicedataSource.sort = this.sort;

				this._cdr.markForCheck();
			});
	}

	searchReceivedPayments() {
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;
		let customerid = this.submitForm.value.customerid;
		let searchtype = this.submitForm.value.searchtype;
		let invoiceno = this.submitForm.value.invoiceno;

		this._commonApiService
			.getPaymentsByCenter({
				centerid: this.userdata.center_id,
				fromdate: fromdate,
				todate: todate,
				customerid: customerid,
				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.paymentdata = data.body;
				this.paymentdataSource.data = data.body;

				this.paymentdataSource.sort = this.sort;
				this.pageLength = data.body.length;
				this._cdr.markForCheck();
			});
	}

	searchReceivedPaymentsOverview() {
		let fromdate = this.submitForm.value.fromdate;
		let todate = this.submitForm.value.todate;
		let customerid = this.submitForm.value.customerid;
		let searchtype = this.submitForm.value.searchtype;
		let invoiceno = this.submitForm.value.invoiceno;

		this._commonApiService
			.getPaymentsOverviewByCenter({
				centerid: this.userdata.center_id,
				fromdate: fromdate,
				todate: todate,
				customerid: customerid,
				searchtype: searchtype,
				invoiceno: invoiceno,
			})
			.subscribe((data: any) => {
				this.paymentdata = data.body;
				this.paymentOverviewdataSource.data = data.body;

				this.paymentOverviewdataSource.sort = this.sort;
				this.pageLength = data.body.length;

				this._cdr.markForCheck();
			});
	}

	clearCustomers() {
		this.submitForm.patchValue({
			customerid: 'all',
			customerctrl: 'All Customers',
		});
		this.submitForm.controls['customerctrl'].setErrors(null);
		this._cdr.markForCheck();
		// this.searchPendingPayments();
	}

	radioClickHandle() {
		if (this.submitForm.value.searchtype === 'invonly') {
			this.submitForm.get('customerctrl').disable();
		} else {
			this.submitForm.value.invoiceno = '';
			this.submitForm.patchValue({
				invoiceno: '',
				searchtype: 'all',
			});

			this.submitForm.get('customerctrl').enable();
			this.submitForm.controls['invoiceno'].setErrors(null);
			this.submitForm.controls['invoiceno'].markAsTouched();
		}
		this._cdr.detectChanges();
	}

	viewAllCustomers() {
		this._router.navigate([`/home/view-customers`]);
	}

	goCustomerFinancials(customer_id) {
		this._router.navigate([`/home/financials-customer/${this.userdata.center_id}/${customer_id}`]);
	}

	addPayments() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		dialogConfig.width = '80%';
		dialogConfig.height = '80%';
		dialogConfig.data = { invoicesdata: this.invoicesdata };
debugger;
		const dialogRef = this._dialog.open(AccountsReceivablesComponent, dialogConfig);

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

		this._commonApiService.getCustomerDetails(this.userdata.center_id, element.customer_id).subscribe((customerdata) => {
			const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = true;
			dialogConfig.width = '80%';
			dialogConfig.height = '80%';
			dialogConfig.data = {
				customerdata: customerdata[0],
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
		});
	}

	showCustomerStatement() {
		this._router.navigate([`/home/statement-reports`]);
	}

	exportPendingPaymentsToExcel() {
		const fileName = 'Pending_Receivables_Reports.xlsx';

		let reportData = JSON.parse(JSON.stringify(this.saleInvoicedataSource.data));

		reportData.forEach((e) => {
			e['Customer Name'] = e['customer_name'];
			delete e['customer_name'];
			e['Invoice #'] = e['invoice_no'];
			delete e['invoice_no'];
			e['Invoice Date'] = e['invoice_date'];
			delete e['invoice_date'];
			e['Aging Days'] = e['aging_days'];
			delete e['aging_days'];
			e['Invoice Amount'] = e['invoice_amt'];
			delete e['invoice_amt'];
			e['Sale Type'] = e['sale_type'];
			delete e['sale_type'];
			e['Payment Status'] = e['payment_status'];
			delete e['payment_status'];
			e['Paid Amount'] = e['paid_amount'];
			delete e['paid_amount'];
			e['Balance Amount'] = e['bal_amount'];
			delete e['bal_amount'];
			delete e['sale_id'];
			delete e['center_id'];
			delete e['customer_id'];
			delete e['customer_address1'];
			delete e['customer_address2'];
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
					header: 'Pending Receivables Reports',
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

	exportPaymentsToExcel() {
		this.arr = [];
		const fileName = 'Received_Payments_Reports.xlsx';

		this.arr = this.paymentdata;
		this.arr.forEach((e) => {
			e['Customer Name'] = e['customer_name'];
			delete e['customer_name'];

			e['Pymt Mode'] = e['pymt_mode_name'];
			delete e['pymt_mode_name'];

			e['Bank Ref'] = e['bank_ref'];
			delete e['bank_ref'];

			e['Payment Ref'] = e['pymt_ref'];
			delete e['pymt_ref'];

			e['Payment No'] = e['payment_no'];
			delete e['payment_no'];

			e['Payment Date'] = e['pymt_date'];
			delete e['pymt_date'];

			e['Advance Amount Used'] = e['advance_amt_used'];
			delete e['advance_amt_used'];

			e['Invoice #'] = e['invoice_no'];
			delete e['invoice_no'];

			e['Invoice Date'] = e['invoice_date'];
			delete e['invoice_date'];

			e['Paid Amount'] = e['applied_amount'];
			delete e['applied_amount'];

			delete e['sale_id'];
			delete e['center_id'];
			delete e['customer_id'];
			delete e['customer_address1'];
			delete e['customer_address2'];
			delete e['pymt_mode_ref_id'];
			delete e['last_updated'];
		});

		const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);
		const wb1: xlsx.WorkBook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');

		//then add ur Title txt
		xlsx.utils.sheet_add_json(
			wb1.Sheets.sheet1,
			[
				{
					header: 'Received Payments Reports',
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
		xlsx.utils.sheet_add_json(wb1.Sheets.sheet1, this.arr, {
			skipHeader: false,
			origin: 'A2',
		});

		xlsx.writeFile(wb1, fileName);
	}
}
