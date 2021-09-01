import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

import { MatDialog, MatDialogConfig, DialogPosition } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Observable } from 'rxjs';
import { User } from '../../models/User';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { MatSort } from '@angular/material/sort';
import { IonSearchbar } from '@ionic/angular';
import { SalesInvoiceDialogComponent } from 'src/app/components/sales/sales-invoice-dialog/sales-invoice-dialog.component';
import { PurchaseEntryDialogComponent } from 'src/app/components/purchase/purchase-entry-dialog/purchase-entry-dialog.component';

@Component({
	selector: 'app-inventory-reports',
	templateUrl: './inventory-reports.page.html',
	styleUrls: ['./inventory-reports.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryReportsPage implements OnInit {
	center_id: any;

	pageLength = 0;
	isTableHasData = true;

	userdata$: Observable<User>;
	ready = 0; // flag check - centerid (localstorage) & customerid (param)

	@ViewChild('mySearchbar', { static: true }) searchbar: IonSearchbar;

	displayedColumns: string[] = ['brandname', 'code', 'description', 'module', 'invoiceno', 'customername', 'txnqty', 'stocklevel', 'txndate'];
	dataSource = new MatTableDataSource<any>();

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	constructor(
		private _authservice: AuthenticationService,
		private _cdr: ChangeDetectorRef,
		private _commonApiService: CommonApiService,
		private _dialog: MatDialog,
		private _route: ActivatedRoute,
		private _router: Router
	) {
		this.isTableHasData = false;
		this.userdata$ = this._authservice.currentUser;
		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this.center_id = data.center_id;
			this.ready = 1;

			this._cdr.markForCheck();
		});
	}

	applyFilter(filterValue: string) {
		if (filterValue.trim().length > 0) {
			//todo
			//		this.reloadInventoryReport(filterValue.trim().toLocaleLowerCase());
		} else {
			this.dataSource.data = [];

			this.isTableHasData = false;
		}
	}

	ngOnInit() {
		this.dataSource.paginator = this.paginator;
	}

	reset() {
		this.searchbar.value = '';
		this.dataSource.data = [];
	}

	reloadInventoryReport(product_code, product_id) {
		this._commonApiService
			.fetchProductInventoryReports({ center_id: this.center_id, product_code: product_code, product_id: product_id })
			.subscribe((data: any) => {
				// DnD - code to add a "key/Value" in every object of array
				this.dataSource.data = data.body;

				if (this.dataSource.data.length > 0) {
					this.isTableHasData = true;
				}

				this.dataSource.sort = this.sort;
				this.pageLength = data.length;
			});

		this._cdr.markForCheck();
	}

	openDialog(action, invoice, sale_id, purchase_id, customer_id, vendor_id): void {
		if (action === 'Sale') {
			this.openSaleDialog({ id: sale_id, center_id: this.center_id, customer_id: customer_id });
		} else if (action === 'Purchase') {
			this.openPurchaseDialog({ id: purchase_id, center_id: this.center_id, vendor_id: vendor_id });
		}
	}

	openSaleDialog(row): void {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '50%';
		dialogConfig.height = '100%';
		dialogConfig.data = row;
		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(SalesInvoiceDialogComponent, dialogConfig);

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
		});
	}

	openPurchaseDialog(row): void {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '50%';
		dialogConfig.height = '100%';
		dialogConfig.data = row;
		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(PurchaseEntryDialogComponent, dialogConfig);

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
		});
	}
}
