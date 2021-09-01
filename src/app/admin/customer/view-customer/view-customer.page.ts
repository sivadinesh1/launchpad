import { Component, OnInit, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonApiService } from 'src/app/services/common-api.service';
import { IonSearchbar } from '@ionic/angular';

import { Customer } from 'src/app/models/Customer';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';

import { User } from 'src/app/models/User';
import { filter, tap, catchError } from 'rxjs/operators';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Observable, lastValueFrom, of } from 'rxjs';
import * as xlsx from 'xlsx';
import { CustomerAddDialogComponent } from 'src/app/components/customers/customer-add-dialog/customer-add-dialog.component';
import { CustomerEditDialogComponent } from 'src/app/components/customers/customer-edit-dialog/customer-edit-dialog.component';
import { CustomerEditShippingAddressComponent } from 'src/app/components/customers/customer-edit-shipping-address/customer-edit-shipping-address.component';
import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { DefaultDiscountsComponent } from 'src/app/components/customers/discount/default-discounts/default-discounts.component';
import { BrandDiscountsComponent } from 'src/app/components/customers/discount/brand-discounts/brand-discounts.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingService } from 'src/app/services/loading.service';
import { HelperUtilsService } from 'src/app/services/helper-utils.service';

@Component({
	selector: 'app-view-customer',
	templateUrl: './view-customer.page.html',
	styleUrls: ['./view-customer.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewCustomerPage implements OnInit {
	center_id: any;
	customer$: Observable<Customer[]>;
	userdata$: Observable<User>;
	userdata: any;
	isTableHasData = true;
	arr: Array<any>;

	ready = 0;
	pcount: any;
	noMatch: any;
	responseMsg: string;
	pageLength: any;

	resultsize = 0;
	customerslist: any;
	customersOriglist: any;

	isloaded = false;
	isactive = true;

	@ViewChild('mySearchbar', { static: true }) searchbar: IonSearchbar;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	displayedColumns: string[] = ['name', 'address1', 'credit', 'actions'];
	dataSource = new MatTableDataSource<Customer>();

	constructor(
		private _authservice: AuthenticationService,
		private _cdr: ChangeDetectorRef,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar,
		private _commonApiService: CommonApiService,
		private _route: ActivatedRoute,
		private _router: Router,
		private _loadingService: LoadingService,
		public _helperUtilsService: HelperUtilsService,
	) {
		this.userdata$ = this._authservice.currentUser;

		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this.center_id = data.center_id;
			this.ready = 1;
			this.reloadCustomers();
			this._cdr.markForCheck();
		});

		this._route.params.subscribe((params) => {
			this.init();
		});
	}

	init() {
		if (this.ready === 1) {
			this.reloadCustomers();
		}
	}

	reloadCustomers() {
		this.isloaded = false;
		this._commonApiService.getAllActiveCustomers(this.center_id).subscribe((data: any) => {
			this.arr = data;
			this.isloaded = true;
			// DnD - code to add a "key/Value" in every object of array
			this.dataSource.data = data.map((el) => {
				var o = Object.assign({}, el);
				o.isExpanded = false;
				return o;
			});

			this.dataSource.sort = this.sort;
			this.pageLength = data.length;
		});
	}

	ngOnInit() {
		this.dataSource.paginator = this.paginator;
	}

	add() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '500px';
		dialogConfig.height = '100%';
		dialogConfig.position = { top: '0', right: '0' };
		dialogConfig.panelClass = 'app-full-bleed-dialog';

		const dialogRef = this._dialog.open(CustomerAddDialogComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					this.reloadCustomers();
					this._cdr.markForCheck();
				}),
			)
			.subscribe((data: any) => {
				if (data === 'success') {
					this._loadingService.openSnackBar('Customer added successfully', '');
				}
			});
	}

	edit(customer: Customer) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '500px';
		dialogConfig.height = '100%';
		dialogConfig.position = { top: '0', right: '0' };
		dialogConfig.data = customer;
		dialogConfig.panelClass = 'app-full-bleed-dialog';

		const dialogRef = this._dialog.open(CustomerEditDialogComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					this.reloadCustomers();
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
					dialogConfigSuccess.data = 'Customer updated successfully';

					const dialogRef = this._dialog.open(SuccessMessageDialogComponent, dialogConfigSuccess);
				}
			});
	}

	editShippingAddress(customer: Customer) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = false;
		dialogConfig.width = '80%';
		dialogConfig.height = '80%';
		dialogConfig.data = customer;

		const dialogRef = this._dialog.open(CustomerEditShippingAddressComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					this.reloadCustomers();
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
					dialogConfigSuccess.data = 'Customer updated successfully';

					const dialogRef = this._dialog.open(SuccessMessageDialogComponent, dialogConfigSuccess);
				}
			});
	}

	goCustomerFinancials(item) {
		this._router.navigate([`/home/financials-customer/${this.center_id}/${item.id}`]);
	}

	reset() {
		this.searchbar.value = '';
		this.resultsize = 0;
		this.customerslist = null;
	}

	applyFilter(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.dataSource.filter = filterValue;

		if (this.dataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	async exportCustomerDataToExcel() {
		const fileName = 'Active_Customers_Reports.xlsx';

		let reportData = JSON.parse(JSON.stringify(this.arr));

		reportData.forEach((e) => {
			delete e['id'];
			delete e['center_id'];
			delete e['state_id'];
			delete e['code'];
			delete e['isactive'];
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
					header: 'Customers List',
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

	editdefault(element) {
		this._commonApiService.getAllCustomerDefaultDiscounts(this.center_id, element.id).subscribe((data: any) => {
			const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = true;
			dialogConfig.width = '300px';
			dialogConfig.height = '100%';
			dialogConfig.data = data[0];
			dialogConfig.position = { top: '0', right: '0' };

			const dialogRef = this._dialog.open(DefaultDiscountsComponent, dialogConfig);

			dialogRef
				.afterClosed()
				.pipe(
					filter((val) => !!val),
					tap(() => {
						this.reloadCustomers();
						this._cdr.markForCheck();
					}),
				)
				.subscribe((data: any) => {
					if (data.body === 1) {
						const dialogConfigSuccess = new MatDialogConfig();
						dialogConfigSuccess.disableClose = false;
						dialogConfigSuccess.autoFocus = true;
						dialogConfigSuccess.width = '25%';
						dialogConfigSuccess.height = '25%';
						dialogConfigSuccess.data = 'Discount updated successfully';

						const dialogRef = this._dialog.open(SuccessMessageDialogComponent, dialogConfigSuccess);
					}
				});
		});
	}

	manageBrandDiscounts(element) {
		this._commonApiService.getAllCustomerDefaultDiscounts(this.center_id, element.id).subscribe((data: any) => {
			const dialogConfig = new MatDialogConfig();
			dialogConfig.disableClose = true;
			dialogConfig.autoFocus = true;
			dialogConfig.width = '80%';
			dialogConfig.height = '80%';
			dialogConfig.data = data;

			const dialogRef = this._dialog.open(BrandDiscountsComponent, dialogConfig);

			dialogRef
				.afterClosed()
				.pipe(
					filter((val) => !!val),
					tap(() => {
						this.reloadCustomers();
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
						dialogConfigSuccess.data = 'Discounts successfull';

						const dialogRef = this._dialog.open(SuccessMessageDialogComponent, dialogConfigSuccess);
					}
				});
		});
	}
}
