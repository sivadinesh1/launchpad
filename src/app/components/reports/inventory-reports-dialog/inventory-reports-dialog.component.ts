import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { SalesInvoiceDialogComponent } from '../../sales/sales-invoice-dialog/sales-invoice-dialog.component';
import { PurchaseEntryDialogComponent } from '../../purchase/purchase-entry-dialog/purchase-entry-dialog.component';

import { MatDialog, MatDialogConfig, DialogPosition } from '@angular/material/dialog';

@Component({
	selector: 'app-inventory-reports-dialog',
	templateUrl: './inventory-reports-dialog.component.html',
	styleUrls: ['./inventory-reports-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryReportsDialogComponent implements OnInit {
	resultList = [];

	product_code;
	center_id;
	product_id;

	constructor(
		private _commonApiService: CommonApiService,
		private _modalcontroller: ModalController,
		private _cdr: ChangeDetectorRef,
		private _dialog: MatDialog,
	) {}

	ngOnInit() {
		// console.log('object...product_code..' + this.product_code1);
		// console.log('object...product_code..' + this.center_id1);
	}

	ionViewDidEnter() {
		this._commonApiService
			.fetchProductInventoryReports({ center_id: this.center_id, product_code: this.product_code, product_id: this.product_id })
			.subscribe((data: any) => {
				// DnD - code to add a "key/Value" in every object of array
				this.resultList = data.body;
				this._cdr.markForCheck();
			});
	}

	openDialog(action, invoice, sale_id, purchase_id, customer_id, vendor_id): void {
		debugger;
		if (action.startsWith('Sale')) {
			this.openSaleDialog({ id: sale_id, center_id: this.center_id, customer_id: customer_id });
		} else if (action.startsWith('Purchase')) {
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

	reset() {}

	closeModal() {
		this._modalcontroller.dismiss();
	}
}
