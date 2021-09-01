import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Inject,
	OnInit,
	ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
	MatDialog,
	MatDialogConfig,
	MatDialogRef,
	MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Customer } from 'src/app/models/Customer';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';

import * as xlsx from 'xlsx';

@Component({
	selector: 'app-purchase-entry-dialog',
	templateUrl: './purchase-entry-dialog.component.html',
	styleUrls: ['./purchase-entry-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseEntryDialogComponent implements OnInit {
	purchasemasterdata: any;
	purchasedetailsdata: any;
	customerdata: any;
	centerdata: any;

	data: any;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<PurchaseEntryDialogComponent>,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		@Inject(MAT_DIALOG_DATA) data: any,
		public _dialog: MatDialog,
		private _commonApiService: CommonApiService
	) {
		this.data = data;
	}

	ngOnInit() {
		this._commonApiService
			.purchaseMasterData(this.data.id)
			.subscribe((data: any) => {
				this.purchasemasterdata = data[0];

				this._cdr.markForCheck();
			});

		this._commonApiService
			.purchaseDetails(this.data.id)
			.subscribe((data: any) => {
				this.purchasedetailsdata = data;

				this._cdr.markForCheck();
			});

		this._commonApiService
			.getVendorDetails(this.data.center_id, this.data.vendor_id)
			.subscribe((data: any) => {
				this.customerdata = data[0];

				this._cdr.markForCheck();
			});
	}

	close() {
		this.dialogRef.close();
	}

	async exportToExcel() {
		const fileName = `Purchase_Order_Reports_${this.purchasemasterdata?.invoice_no}.xlsx`;

		let reportData = JSON.parse(JSON.stringify(this.purchasedetailsdata));

		reportData.forEach((e) => {
			e['Product Code'] = e['product_code'];
			delete e['product_code'];

			e['Description'] = e['description'];
			delete e['description'];

			e['HSNcode'] = e['hsncode'];
			delete e['hsncode'];

			e['TAX'] = e['tax'];
			delete e['tax'];

			e['MRP'] = e['mrp'];
			delete e['mrp'];

			e['Purchase Price'] = e['purchase_price'];
			delete e['purchase_price'];

			e['Quantity'] = e['qty'];
			delete e['qty'];

			e['Total Value'] = e['total_value'];
			delete e['total_value'];

			delete e['id'];
			delete e['batchdate'];
			delete e['cgst'];
			delete e['igst'];
			delete e['packetsize'];

			delete e['product_id'];
			delete e['purchase_id'];

			delete e['revision'];
			delete e['sgst'];
			delete e['stock_id'];
			delete e['stock_pk'];
			delete e['tax_value'];
			delete e['taxable_value'];
			delete e['taxrate'];
			delete e['total_value'];
		});

		const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);
		const wb1: xlsx.WorkBook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');

		//then add ur Title txt
		xlsx.utils.sheet_add_json(
			wb1.Sheets.sheet1,
			[
				{
					header: 'Purchase Reports',
					invoiceno: this.purchasemasterdata?.invoice_no,
				},
			],
			{
				skipHeader: true,
				origin: 'A1',
			}
		);

		//start frm A2 here
		xlsx.utils.sheet_add_json(wb1.Sheets.sheet1, reportData, {
			skipHeader: false,
			origin: 'A2',
		});

		xlsx.writeFile(wb1, fileName);
	}
}
