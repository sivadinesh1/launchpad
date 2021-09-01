import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../../../services/authentication.service';
import { filter, tap } from 'rxjs/operators';

import { User } from '../../../models/User';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';

import { ProductAddDialogComponent } from 'src/app/components/products/product-add-dialog/product-add-dialog.component';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { Product } from 'src/app/models/Product';
import { ProductEditDialogComponent } from 'src/app/components/products/product-edit-dialog/product-edit-dialog.component';
import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import { ProductCorrectionDialogComponent } from 'src/app/components/products/product-correction-dialog/product-correction-dialog.component';
import { InventoryReportsDialogComponent } from 'src/app/components/reports/inventory-reports-dialog/inventory-reports-dialog.component';

@Component({
	selector: 'app-view-products',
	templateUrl: './view-products.page.html',
	styleUrls: ['./view-products.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class ViewProductsPage implements OnInit {
	productinfo: any;

	center_id: any;

	pcount: any;
	pageLength: any;
	isTableHasData = false;

	userdata$: Observable<User>;
	userdata: any;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	@ViewChild('epltable', { static: false }) epltable: ElementRef;

	displayedColumns: string[] = ['productcode', 'description', 'name', 'rackno', 'avlstock', 'mrp', 'actions'];
	dataSource = new MatTableDataSource<Product>();

	tempsearchstring = '';
	mrp_flag = false;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _commonApiService: CommonApiService,
		private _snackBar: MatSnackBar,
		private _route: ActivatedRoute,
		private _dialog: MatDialog,
		private _router: Router,
		private _authservice: AuthenticationService,
		private _modalcontroller: ModalController,
	) {
		this.userdata$ = this._authservice.currentUser;
		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this.userdata = data;
			this.center_id = this.userdata.center_id;

			this._cdr.markForCheck();
		});

		this._route.params.subscribe((params) => {
			this.tempsearchstring = '';
			if (this.userdata !== undefined) {
				this.reset();
			}
		});
	}

	ngOnInit() {
		this.dataSource.paginator = this.paginator;
	}

	addProduct() {
		this._router.navigate([`/home/product/add`]);
	}

	editProduct(item) {
		this._router.navigateByUrl(`/home/product/edit/${this.center_id}/${item.product_id}`);
	}

	ionViewDidEnter() {}

	openDialog(searchstring): void {
		this._commonApiService.getProductInfo({ centerid: this.center_id, searchstring: searchstring }).subscribe((data: any) => {
			this.tempsearchstring = searchstring;

			// DnD - code to add a "key/Value" in every object of array
			this.dataSource.data = data.body.map((el) => {
				var o = Object.assign({}, el);
				o.isExpanded = false;
				return o;
			});

			this.dataSource.sort = this.sort;
			this.pageLength = data.body.length;

			if (data.body.length === 0) {
				this.isTableHasData = false;
			} else {
				this.isTableHasData = true;
			}

			if (searchstring.length === 0) {
				this.reset();
				this.isTableHasData = false;
			}

			this._cdr.markForCheck();
		});
	}

	reset() {
		this.dataSource.data = [];
		this.pageLength = 0;
		this.isTableHasData = false;
	}

	add() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '500px';
		dialogConfig.height = '100%';
		dialogConfig.position = { top: '0', right: '0' };
		dialogConfig.panelClass = 'app-full-bleed-dialog';

		const dialogRef = this._dialog.open(ProductAddDialogComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					this._cdr.markForCheck();
				}),
			)
			.subscribe((data: any) => {
				if (data === 'success') {
					this.openSnackBar('Product added successfully', '');
				}
			});
	}

	checked(event) {
		if (event.checked) {
			this.mrp_flag = true;
		} else {
			this.mrp_flag = false;
		}
	}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', 'mat-primary'],
		});
	}
	edit(product: Product) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '500px';
		dialogConfig.height = '100%';
		dialogConfig.data = product;
		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(ProductEditDialogComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					// do nothing
					this.openDialog(this.tempsearchstring);
					this._cdr.markForCheck();
				}),
			)
			.subscribe((data: any) => {
				if (data === 'success') {
					this.openSnackBar('Product edited successfully', '');
				}
			});
	}

	correctProduct(product: Product) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '600px';
		dialogConfig.height = '100%';
		dialogConfig.data = product;
		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(ProductCorrectionDialogComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					// do nothing
					this.openDialog(this.tempsearchstring);
					this._cdr.markForCheck();
				}),
			)
			.subscribe((data: any) => {
				if (data === 'success') {
					this.openSnackBar('Product Corrected successfully', '');
				}
			});
	}

	async exportCompletedPurchaseToExcel() {
		const fileName = `Full_Stock_List_${moment().format('DD-MM-YYYY')}.xlsx`;

		this._commonApiService.fetchFullProductInventoryReports({ centerid: this.center_id, mrp_split: this.mrp_flag }).subscribe((reportdata: any) => {
			let reportData = JSON.parse(JSON.stringify(reportdata.body));

			const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);
			const wb1: xlsx.WorkBook = xlsx.utils.book_new();
			xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');

			//then add ur Title txt
			xlsx.utils.sheet_add_json(
				wb1.Sheets.sheet1,
				[
					{
						header: 'Full Stock Report on ' + moment().format('DD-MM-YYYY'),
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
		});
	}

	async showInventoryReportsDialog(element) {
		const modal = await this._modalcontroller.create({
			component: InventoryReportsDialogComponent,
			componentProps: { center_id: this.center_id, product_code: element.product_code, product_id: element.product_id },
			cssClass: 'select-modal',
		});

		modal.onDidDismiss().then((result) => {
			this._cdr.markForCheck();
		});

		await modal.present();
	}
}

// available_stock: 0
// description: "Bolt Hex (M12X1.75X25X8.8)"
// hsncode: "73181900"
// mrp: "19"
// name: "Swaraj"
// packetsize: 0
// product_code: "000011104P03"
// product_id: 63355
// purchase_price: "11.76"
// rackno: ""
// taxrate: 18
// unit: "Pcs"
