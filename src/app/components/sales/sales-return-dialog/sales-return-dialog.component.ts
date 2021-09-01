import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
	selector: 'app-sales-return-dialog',
	templateUrl: './sales-return-dialog.component.html',
	styleUrls: ['./sales-return-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesReturnDialogComponent implements OnInit {
	salemasterdata: any;
	saledetailsdata: any;
	customerdata: any;
	saleReturnTypeList = ['Others', 'Damaged'];
	selReturnType = 'Others';

	centerdata: any;

	data: any;
	returnArr = [];

	nothingToReturnMsg = '';
	submitForm = [];

	filteredArr: any;

	constructor(
		private _cdr: ChangeDetectorRef,
		private dialogRef: MatDialogRef<SalesReturnDialogComponent>,
		@Inject(MAT_DIALOG_DATA) data: any,
		public _dialog: MatDialog,
		private _commonApiService: CommonApiService,
	) {
		this.data = data;
	}

	ngOnInit() {
		this._commonApiService.getSaleMasterData(this.data.id).subscribe((data: any) => {
			this.salemasterdata = data[0];

			this._cdr.markForCheck();
		});

		this._commonApiService.getSaleDetailsData(this.data.id).subscribe((data: any) => {
			this.saledetailsdata = data;

			if (Array.isArray(this.saledetailsdata)) {
				this.saledetailsdata.forEach((element, idx) => {
					this.processItems(element);
				});
			}

			this._cdr.markForCheck();
		});
	}

	processItems(element) {
		this.returnArr.push({
			description: element.description,
			disc_percent: element.disc_percent,
			disc_type: element.disc_type,
			disc_value: element.disc_value,

			id: element.id,
			igst: element.igst,
			mrp: element.mrp,
			packetsize: element.packetsize,
			product_code: element.product_code,
			product_id: element.product_id,
			qty: element.qty,
			returned: element.returned || 0,
			sale_id: element.sale_id,
			sgst: element.sgst,
			cgst: element.cgst,

			tax: element.tax,
			tax_value: element.tax_value,
			taxable_value: element.taxable_value,
			taxrate: element.taxrate,
			total_value: 0,
			unit_price: element.unit_price,
			received_now: 0,
			error: '',
			reason: 'Others',
			hsncode: element.hsncode,
			unit: element.unit,
		});

		this.calculate();
	}

	reasonChange($event, idx) {
		this.returnArr[idx].reason = $event.target.value;
	}

	calculate() {}

	close() {
		this.dialogRef.close();
	}

	update_change(event$, idx) {
		if (this.returnArr[idx].returned + +event$.target.value > this.returnArr[idx].qty) {
			this.returnArr[idx].error = 'mismatch';
			this._cdr.detectChanges();
			return false;
		} else {
			this.returnArr[idx].error = '';
		}

		this.returnArr[idx].received_now = +event$.target.value;
		this.returnArr[idx].total_value = +((event$.target.value * this.returnArr[idx].mrp * (100 - this.returnArr[idx].disc_percent)) / 100).toFixed(2);
		this.returnArr[idx].tax_value = +(this.returnArr[idx].total_value - this.returnArr[idx].taxable_value).toFixed(2);

		if (this.returnArr[idx].igst !== 0.0) {
			this.returnArr[idx].igst = this.returnArr[idx].tax;
		} else {
			this.returnArr[idx].cgst = this.returnArr[idx].tax / 2;
			this.returnArr[idx].sgst = this.returnArr[idx].tax / 2;
		}
	}

	update_disc_value(event$, idx) {
		this.returnArr[idx].disc_percent = +event$.target.value;
		this.returnArr[idx].total_value = +((this.returnArr[idx].received_now * this.returnArr[idx].mrp * (100 - +event$.target.value)) / 100).toFixed(2);
		this.returnArr[idx].tax_value = +(this.returnArr[idx].total_value - this.returnArr[idx].taxable_value).toFixed(2);
	}

	async return() {
		let isItemsToReturn = this.returnArr.some((e) => {
			return e.received_now > 0;
		});

		let isItemsToReturn1 = this.returnArr.some((e) => {
			return e.received_now > e.qty + e.returned || e.error !== '';
		});

		if (isItemsToReturn && !isItemsToReturn1) {
			console.log('object/... su bit ');

			this.filteredArr = this.returnArr.filter((element) => {
				return element.received_now > 0;
			});

			const sum_to_return_amount = this.returnArr.reduce((accumulator, currentValue) => accumulator + currentValue.total_value, 0).toFixed(2);
			const sum_to_return_items = this.returnArr.reduce((accumulator, currentValue) => accumulator + currentValue.received_now, 0);

			this.submitForm.push(this.filteredArr);
			this.submitForm.push({
				sale_id: this.salemasterdata.id,
				center_id: this.salemasterdata.center_id,
				customer_id: this.salemasterdata.customer_id,
				to_return_amount: sum_to_return_amount,
				to_receive_items: sum_to_return_items,
			});

			console.log('dinesh ....@@.** ' + JSON.stringify(this.submitForm));

			this._commonApiService.addSaleReturn(this.submitForm).subscribe((data: any) => {
				console.log('dinesh ..... ' + data);

				if (data.body === 'success') {
					this.dialogRef.close('success');
				} else {
					// error scenario
				}

				this._cdr.markForCheck();
			});
		} else {
			this.nothingToReturnMsg = 'Nothing to return (or) returns not matching';
		}
	}

	cancel() {
		this.close();
	}
}
