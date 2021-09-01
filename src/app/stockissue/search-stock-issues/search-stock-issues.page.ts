import { Component, OnInit, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { CommonApiService } from '../../services/common-api.service';
import { AuthenticationService } from '../../services/authentication.service';
import * as moment from 'moment';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, lastValueFrom, of } from 'rxjs';
import { Sales } from '../../models/Sales';
import { Customer } from 'src/app/models/Customer';
import { AlertController } from '@ionic/angular';
import { filter, map, startWith } from 'rxjs/operators';
import { User } from 'src/app/models/User';
import { MatDialog, MatDialogConfig, DialogPosition } from '@angular/material/dialog';
import { InvoiceSuccessComponent } from 'src/app/components/invoice-success/invoice-success.component';
import { SalesInvoiceDialogComponent } from 'src/app/components/sales/sales-invoice-dialog/sales-invoice-dialog.component';
import { SalesReturnDialogComponent } from 'src/app/components/sales/sales-return-dialog/sales-return-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EnquiryPrintComponent } from 'src/app/components/enquiry-print/enquiry-print.component';
import * as xlsx from 'xlsx';
import { ConvertToSaleDialogComponent } from 'src/app/components/convert-to-sale-dialog/convert-to-sale-dialog.component';

@Component({
	selector: 'app-search-stock-issues',
	templateUrl: './search-stock-issues.page.html',
	styleUrls: ['./search-stock-issues.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchStockIssuesPage implements OnInit {
	sales$: Observable<Sales[]>;

	stockIssueSales$: Observable<Sales[]>;

	filteredSales$: Observable<Sales[]>;

	filteredValues: any;
	tabIndex = 0;

	resultList: any;

	statusFlag = 'D';
	selectedCust = 'all';

	saletypeFlag = 'all';

	orderDefaultFlag = 'desc';

	today = new Date();
	submitForm: FormGroup;
	maxDate = new Date();
	minDate = new Date();
	dobMaxDate = new Date();

	fromdate = new Date();
	todate = new Date();

	filteredCustomer: Observable<any[]>;
	customer_lis: Customer[];

	@ViewChild('epltable', { static: false }) epltable: ElementRef;

	userdata: any;

	userdata$: Observable<User>;

	statusList = [
		{ id: 'all', value: 'All' },
		{ id: 'D', value: 'Draft' },
		{ id: 'C', value: 'Fullfilled' },
	];

	orderList = [
		{ id: 'desc', value: 'Recent Orders First' },
		{ id: 'asc', value: 'Old Orders First' },
	];

	searchType = [
		{ name: 'All', id: 'all', checked: true },
		{ name: 'Invoice Only', id: 'invonly', checked: false },
	];

	sumTotalValue = 0.0;
	sumNumItems = 0;

	permissionsdata = [];
	permissions$: Observable<any>;

	deleteAccess;

	arr: Array<any>;

	color = 'accent';

	// new FormControl({value: '', disabled: true});
	constructor(
		private _cdr: ChangeDetectorRef,
		private _commonApiService: CommonApiService,
		private _fb: FormBuilder,
		private _router: Router,
		private _route: ActivatedRoute,
		public alertController: AlertController,
		public _dialog: MatDialog,
		private _snackBar: MatSnackBar,
		private _authservice: AuthenticationService,
	) {
		this.submitForm = this._fb.group({
			customerid: ['all'],
			customerctrl: new FormControl({
				value: 'All Customers',
				disabled: false,
			}),
			//customerctrl: [{ value: 'All Customers', disabled: false }],
			todate: [this.todate, Validators.required],
			fromdate: [this.fromdate, Validators.required],
			status: new FormControl('all'),
			saletype: new FormControl('SI'),
			invoiceno: [''],
			searchtype: ['all'],
			order: ['desc'],
		});

		this.userdata$ = this._authservice.currentUser;

		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this._authservice.setCurrentMenu('Stock Issue');
			this.userdata = data;
			this.init();
			this._cdr.markForCheck();
		});

		const dateOffset = 24 * 60 * 60 * 1000 * 90;
		this.fromdate.setTime(this.minDate.getTime() - dateOffset);

		this._route.params.subscribe((params) => {
			if (this.userdata !== undefined) {
				this.init();
			}
		});

		this.permissions$ = this._authservice.currentPermisssion;

		this.permissions$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this.permissionsdata = data;

			if (Array.isArray(this.permissionsdata)) {
				this.deleteAccess = this.permissionsdata.filter((f) => f.resource === 'SALE' && f.operation === 'DELETE')[0].is_access;
			}

			this._cdr.markForCheck();
		});
	}

	filtercustomer(value: any) {
		if (typeof value == 'object') {
			return this.customer_lis.filter((customer) => customer.name.toLowerCase().match(value.name.toLowerCase()));
		} else if (typeof value == 'string') {
			return this.customer_lis.filter((customer) => customer.name.toLowerCase().match(value.toLowerCase()));
		}
	}

	async init() {
		this._commonApiService.getAllActiveCustomers(this.userdata.center_id).subscribe((data: any) => {
			this.customer_lis = data;

			this.filteredCustomer = this.submitForm.controls['customerctrl'].valueChanges.pipe(
				startWith(''),
				map((customer) => (customer ? this.filtercustomer(customer) : this.customer_lis.slice())),
			);
		});

		this.search();
		this._cdr.markForCheck();
	}

	ngOnInit() {}
	// this.form.get('controlname').disable();
	// this.variable.disable()
	radioClickHandle() {
		if (this.submitForm.value.searchtype === 'invonly') {
			this.submitForm.get('customerctrl').disable();
		} else {
			this.submitForm.value.invoiceno = '';
			this.submitForm.get('customerctrl').enable();
			this.submitForm.controls['invoiceno'].setErrors(null);
			this.submitForm.controls['invoiceno'].markAsTouched();
		}
	}
	// this.yourFormName.controls.formFieldName.enable();

	clearInput() {
		this.submitForm.patchValue({
			customerid: 'all',
			customerctrl: '',
		});
		this._cdr.markForCheck();
		this.search();
	}

	getPosts(event) {
		this.submitForm.patchValue({
			customerid: event.option.value.id,
			customerctrl: event.option.value.name,
		});

		this.tabIndex = 0;
		this._cdr.markForCheck();

		this.search();
	}

	async search() {
		if (this.submitForm.value.searchtype !== 'all' && this.submitForm.value.invoiceno.trim().length === 0) {
			console.log('invoice number is mandatory');
			this.submitForm.controls['invoiceno'].setErrors({ required: true });
			this.submitForm.controls['invoiceno'].markAsTouched();
			return false;
		}

		this.sales$ = this._commonApiService.searchSales({
			centerid: this.userdata.center_id,
			customerid: this.submitForm.value.customerid,
			status: this.submitForm.value.status,
			fromdate: this.submitForm.value.fromdate,
			todate: this.submitForm.value.todate,
			saletype: this.submitForm.value.saletype,
			searchtype: this.submitForm.value.searchtype,
			invoiceno: this.submitForm.value.invoiceno,
			order: this.submitForm.value.order,
		});

		this.filteredSales$ = this.sales$;

		let value = await lastValueFrom(this.filteredSales$);

		this.stockIssueSales$ = this.sales$.pipe(map((arr: any) => arr.filter((f) => f.status === 'D' && f.sale_type === 'stockissue')));

		this.filteredValues = value.filter((data: any) => data.status === 'D' && data.sale_type === 'stockissue');

		this.calculateSumTotals();
		this.tabIndex = 0;
		this._cdr.markForCheck();
	}

	goSalesEditScreen(item) {
		this._router.navigateByUrl(`/home/sales/edit/${item.id}/SI`);
	}

	goPrintInvoice(row) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '400px';

		dialogConfig.data = row.id;

		const dialogRef = this._dialog.open(InvoiceSuccessComponent, dialogConfig);

		dialogRef.afterClosed();
	}

	goPrintEnquiry(row) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '600px';

		dialogConfig.data = row;

		const dialogRef = this._dialog.open(EnquiryPrintComponent, dialogConfig);

		dialogRef.afterClosed();
	}

	goStockIssueAddScreen() {
		this._router.navigateByUrl(`/home/sales/edit/0/SI`);
	}

	toDateSelected($event) {
		this.todate = $event.target.value;
		this.tabIndex = 0;
		this.search();
		this._cdr.markForCheck();
	}

	fromDateSelected($event) {
		this.fromdate = $event.target.value;
		this.tabIndex = 0;
		this.search();
		this._cdr.markForCheck();
	}

	// two types of delete, (i) Sale Details lineitem, (ii) Sale Master both
	// are different scenarios, just recording it. Only 'DRAFT(D)' or 'STOCKISSUE(D)' STATUS ARE DELETED
	// first delete sale details(update audit) then delete sale master
	delete(item) {
		this._commonApiService.deleteSaleData(item.id).subscribe((data: any) => {
			if (data.result === 'success') {
				this._commonApiService.deleteSaleMaster(item.id).subscribe((data1: any) => {
					//  DELETE ITEM HISTORY RECORD FOR THIS SALE ID
					this._commonApiService.deleteItemHistory(item.id).subscribe((data: any) => {
						this.openSnackBar('Deleted Successfully', '');
						this.init();
					});
				});
			}
		});
	}

	async presentAlertConfirm(item) {
		const alert = await this.alertController.create({
			header: 'Confirm!',
			message: 'Permantently removes sale. Are you sure to Delete?',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					cssClass: 'secondary',
					handler: (blah) => {
						console.log('Confirm Cancel: blah');
					},
				},
				{
					text: 'Okay',
					handler: () => {
						console.log('Confirm Okay');
						this.delete(item);
					},
				},
			],
		});

		await alert.present();
	}

	async tabClick($event) {
		let value = await lastValueFrom(this.filteredSales$);

		this.filteredValues = value.filter((data: any) => data.status === 'D' && data.sale_type === 'stockissue');

		this.calculateSumTotals();
		this._cdr.markForCheck();
	}

	calculateSumTotals() {
		this.sumTotalValue = 0.0;
		this.sumNumItems = 0;

		this.sumTotalValue = this.filteredValues
			.map((item) => {
				return item.net_total;
			})
			.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
			.toFixed(2);

		this.sumNumItems = this.filteredValues
			.map((item) => {
				return item.no_of_items;
			})
			.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
	}

	openDialog(row): void {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		dialogConfig.width = '50%';
		dialogConfig.height = '100%';
		dialogConfig.data = row;
		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(SalesInvoiceDialogComponent, dialogConfig);

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
		});
	}

	async presentAlert(msg: string) {
		const alert = await this.alertController.create({
			header: 'Message',

			message: msg,
			buttons: ['OK'],
		});

		await alert.present();
		setTimeout(() => {
			this.init();
		}, 1000);
	}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', 'mat-primary'],
		});
	}

	async exportStockIssueSalesToExcel() {
		this.arr = [];
		const fileName = 'Stock_Issue_Sale_Reports.xlsx';

		this.arr = await lastValueFrom(this.stockIssueSales$);

		let reportData = JSON.parse(JSON.stringify(this.arr));

		reportData.forEach((e) => {
			e['Customer Name'] = e['customer_name'];
			delete e['customer_name'];

			e['Invoice #'] = e['invoice_no'];
			delete e['invoice_no'];

			e['Invoice Date'] = e['invoice_date'];
			delete e['invoice_date'];

			e['Sale Type'] = e['sale_type'];
			delete e['sale_type'];

			e['Total Qty'] = e['total_qty'];
			delete e['total_qty'];

			e['# of Items'] = e['no_of_items'];
			delete e['no_of_items'];

			e['Taxable Value'] = e['taxable_value'];
			delete e['taxable_value'];

			e['CGST'] = e['cgst'];
			delete e['cgst'];

			e['SGST'] = e['sgst'];
			delete e['sgst'];

			e['IGST'] = e['igst'];
			delete e['igst'];

			e['IGST'] = e['igst'];
			delete e['igst'];

			e['Total Value'] = e['total_value'];
			delete e['total_value'];

			e['Net Total'] = e['net_total'];
			delete e['net_total'];

			e['Sale Date Time'] = e['sale_datetime'];
			delete e['sale_datetime'];

			delete e['id'];
			delete e['center_id'];
			delete e['customer_id'];
			delete e['lr_no'];
			delete e['lr_date'];
			delete e['received_date'];
			delete e['order_no'];
			delete e['order_date'];
			delete e['transport_charges'];

			delete e['unloading_charges'];
			delete e['misc_charges'];
			delete e['status'];
			delete e['revision'];
			delete e['tax_applicable'];
			delete e['roundoff'];
			delete e['retail_customer_name'];
			delete e['retail_customer_address'];
			delete e['no_of_boxes'];

			delete e['stock_issue_date_ref'];
			delete e['stock_issue_ref'];
		});
		this.arr.splice(0, 1);

		const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);
		const wb1: xlsx.WorkBook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');

		//then add ur Title txt
		xlsx.utils.sheet_add_json(
			wb1.Sheets.sheet1,
			[
				{
					header: 'Stock Issue Sale Reports',
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

	async presentConvertSaleConfirm(item) {
		const alert = await this.alertController.create({
			header: 'Confirm!',
			message: 'This change cannot be rolled back. Are you sure?',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					cssClass: 'secondary',
					handler: (blah) => {
						console.log('Confirm Cancel: blah');
					},
				},
				{
					text: 'Convert to sale',
					handler: () => {
						console.log('Confirm Okay');

						this.convertToSale(item);
					},
				},
			],
		});

		await alert.present();
	}

	convertToSale(item) {
		// pass sale id and call backend
		// refresh the page with latest values (invoice # and inv type)

		this._commonApiService
			.convertToSale({
				center_id: this.userdata.center_id,
				sales_id: item.id,
				old_invoice_no: item.invoice_no,
				old_stock_issued_date: item.invoice_date,
				customer_id: item.customer_id,
				net_total: item.net_total,
			})
			.subscribe((data: any) => {
				console.log('object');

				if (data.body.result === 'success') {
					this.convertToInvoiceSuccess(data.body.invoiceNo, moment().format('DD-MM-YYYY'));
				}
			});
	}

	convertToInvoiceSuccess(invoice_id, invoice_date) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '400px';

		dialogConfig.data = { invoiceid: invoice_id, invoicedate: invoice_date };

		const dialogRef = this._dialog.open(ConvertToSaleDialogComponent, dialogConfig);

		dialogRef.afterClosed().subscribe((data) => {
			console.log('The dialog was closed');
			this._router.navigateByUrl('/home/search-sales');
		});
	}
}
