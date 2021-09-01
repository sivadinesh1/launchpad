import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonApiService } from '../../../services/common-api.service';
import { AuthenticationService } from '../../../services/authentication.service';
import * as moment from 'moment';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, lastValueFrom } from 'rxjs';
import { Sales } from '../../../models/Sales';
import { Customer } from 'src/app/models/Customer';
import { AlertController } from '@ionic/angular';
import { filter, map, startWith } from 'rxjs/operators';
import { User } from 'src/app/models/User';
import { MatDialog, MatDialogConfig, DialogPosition } from '@angular/material/dialog';
import { InvoiceSuccessComponent } from 'src/app/components/invoice-success/invoice-success.component';
import { SalesInvoiceDialogComponent } from 'src/app/components/sales/sales-invoice-dialog/sales-invoice-dialog.component';
import { SaleReturnViewComponent } from 'src/app/components/returns/sale-return-view/sale-return-view.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'app-search-return-sales',
	templateUrl: './search-return-sales.page.html',
	styleUrls: ['./search-return-sales.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchReturnSalesPage implements OnInit {
	sales$: Observable<Sales[]>;

	draftSales$: Observable<Sales[]>;
	fullfilledSales$: Observable<Sales[]>;

	filteredSales$: Observable<Sales[]>;

	filteredValues: any;
	tabIndex = 0;

	resultList: any;

	statusFlag = 'D';
	selectedCust = 'all';

	saletypeFlag = 'all';

	today = new Date();
	submitForm: FormGroup;
	maxDate = new Date();
	minDate = new Date();
	dobMaxDate = new Date();

	fromdate = new Date();
	todate = new Date();

	filteredCustomer: Observable<any[]>;
	customer_lis: Customer[];

	userdata: any;

	userdata$: Observable<User>;

	statusList = [
		{ id: 'all', value: 'All' },
		{ id: 'D', value: 'Draft' },
		{ id: 'C', value: 'Fullfilled' },
	];

	saletypeList = [
		{ id: 'all', value: 'All' },
		{ id: 'GI', value: 'Invoice' },
		{ id: 'SI', value: 'Stock Issue' },
	];

	searchType = [
		{ name: 'All', id: 'all', checked: true },
		{ name: 'By Invoice', id: 'byinvoice', checked: false },
		{ name: 'By CreditNote', id: 'bycreditnote', checked: false },
	];

	sumTotalValue = 0.0;
	sumNumItems = 0;

	selectedSearchType = 'all';

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
			saletype: new FormControl('all'),
			searchby: [''],
			searchtype: ['all'],
		});

		this.userdata$ = this._authservice.currentUser;

		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this.userdata = data;
			this.init();
			this._cdr.markForCheck();
		});

		const dateOffset = 24 * 60 * 60 * 1000 * 7;
		this.fromdate.setTime(this.minDate.getTime() - dateOffset);

		this._route.params.subscribe((params) => {
			if (this.userdata !== undefined) {
				this.init();
			}
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
	searchTypeHandle() {
		if (this.submitForm.value.searchtype !== 'all') {
			this.submitForm.get('customerctrl').disable();
		} else {
			this.submitForm.value.searchby = '';
			this.submitForm.get('customerctrl').enable();
			this.submitForm.controls['searchby'].setErrors(null);
			this.submitForm.controls['searchby'].markAsTouched();
		}
		this.selectedSearchType = this.submitForm.value.searchtype;
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
		if (this.submitForm.value.searchtype !== 'all' && this.submitForm.value.searchby.trim().length === 0) {
			console.log('invoice number is mandatory');
			this.submitForm.controls['searchby'].setErrors({ required: true });
			this.submitForm.controls['searchby'].markAsTouched();
			return false;
		}

		this.sales$ = this._commonApiService.searchSaleReturn({
			centerid: this.userdata.center_id,
			customerid: this.submitForm.value.customerid,

			fromdate: this.submitForm.value.fromdate,
			todate: this.submitForm.value.todate,

			searchtype: this.submitForm.value.searchtype,
			searchby: this.submitForm.value.searchby,
		});

		this.filteredSales$ = this.sales$;

		let value = await lastValueFrom(this.filteredSales$);

		this.filteredValues = value.filter((data: any) => data.return_status === 'A');

		// to calculate the count on each status
		this.draftSales$ = this.sales$.pipe(map((arr: any) => arr.filter((f) => f.return_status === 'A')));
		this.fullfilledSales$ = this.sales$.pipe(map((arr: any) => arr.filter((f) => f.return_status === 'C')));
		this.calculateSumTotals();
		this.tabIndex = 0;
		this._cdr.markForCheck();
	}

	goSalesEditScreen(item) {
		if (item.status === 'C') {
			this.editCompletedSalesConfirm(item);
		} else {
			this._router.navigateByUrl(`/home/sales/edit/${item.id}`);
		}
	}

	goSalesAddScreen() {
		this._router.navigateByUrl(`/home/sales/edit/0`);
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
			message: 'Removes sale permanently. Are you sure to Delete?',
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

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', 'mat-primary'],
		});
	}

	async tabClick($event) {
		let value = await lastValueFrom(this.filteredSales$);

		if ($event.index === 0) {
			this.filteredValues = value.filter((data: any) => data.return_status === 'A');
		} else if ($event.index === 1) {
			this.filteredValues = value.filter((data: any) => data.return_status === 'C');
		}

		this.calculateSumTotals();
		this._cdr.detectChanges();
	}

	calculateSumTotals() {
		this.sumTotalValue = 0.0;
		this.sumNumItems = 0;

		this.sumTotalValue = this.filteredValues
			.map((item) => {
				return item.to_return_amount;
			})
			.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
			.toFixed(2);

		this.sumNumItems = this.filteredValues
			.map((item) => {
				return item.to_receive_items;
			})
			.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
	}

	async editCompletedSalesConfirm(item) {
		const alert = await this.alertController.create({
			header: 'Confirm!',
			message: 'Editing completed sales, Are you sure?',
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
					text: 'Go to sales screen',
					handler: () => {
						console.log('Confirm Okay');
						this._router.navigateByUrl(`/home/sales/edit/${item.id}`);
					},
				},
			],
		});

		await alert.present();
	}

	salesReturn(row): void {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '60%';
		dialogConfig.height = '100%';
		dialogConfig.data = row;
		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(SaleReturnViewComponent, dialogConfig);

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
			if (result === 'success') {
				this.presentAlert('Received Items succcessfully!');
			}
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

	goPrintCreditNote(item) {
		let submitForm = {
			sale_return_id: item.sale_return_id,
			center_id: item.center_id,
			sale_id: item.sale_id,
			credit_note_no: item.credit_note_no,
		};

		this._commonApiService.printCreditNote(submitForm).subscribe((data: any) => {
			console.log('object...PRINTED');

			const blob = new Blob([data], { type: 'application/pdf' });

			// to save as file in ionic projects dnd
			// FileSaver.saveAs(blob, '_export_' + new Date().getTime() + '.pdf');

			// dnd - opens as iframe and ready for print (opens with print dialog box)
			// const blobUrl = URL.createObjectURL(blob);
			// const iframe = document.createElement('iframe');
			// iframe.style.display = 'none';
			// iframe.src = blobUrl;
			// document.body.appendChild(iframe);
			// iframe.contentWindow.print();

			// dnd to open in new tab - does not work with pop up blocked
			var link = document.createElement('a');
			link.href = window.URL.createObjectURL(blob);
			link.target = '_blank';
			link.click();
			// if need to download with file name
			//  link.download = "filename.ext"

			// dnd - if need to do anyhting on click - not much use
			// link.onclick = function () {
			//   window.open(window.URL.createObjectURL(blob),
			//     '_blank',
			//     'width=300,height=250');
			//   return false;
			// };

			// var newWin = window.open(url);
			// if(!newWin || newWin.closed || typeof newWin.closed=='undefined')
			// {
			//POPUP BLOCKED
			// }
		});
	}
}
