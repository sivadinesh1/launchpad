import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Customer } from 'src/app/models/Customer';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import { CustomerViewDialogComponent } from '../../customers/customer-view-dialog/customer-view-dialog.component';
import * as xlsx from 'xlsx';
import { InvoiceSuccessComponent } from '../../invoice-success/invoice-success.component';
import { WhatsappDialogComponent } from '../../social/whatsapp/whatsapp-dialog/whatsapp-dialog.component';

@Component({
	selector: 'app-sales-invoice-dialog',
	templateUrl: './sales-invoice-dialog.component.html',
	styleUrls: ['./sales-invoice-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesInvoiceDialogComponent implements OnInit {
	salemasterdata: any;
	saledetailsdata: any;
	customerdata: any;
	centerdata: any;

	data: any;

	@ViewChild('epltable', { static: false }) epltable: ElementRef;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<SalesInvoiceDialogComponent>,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		@Inject(MAT_DIALOG_DATA) data: any,
		public _dialog: MatDialog,
		private _commonApiService: CommonApiService
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

			this._cdr.markForCheck();
		});

		this._commonApiService.getCustomerDetails(this.data.center_id, this.data.customer_id).subscribe((data: any) => {
			this.customerdata = data[0];

			this._cdr.markForCheck();
		});

		this.dialogRef.keydownEvents().subscribe((event) => {
			if (event.key === 'Escape') {
				this.close();
			}
		});

		this.dialogRef.backdropClick().subscribe((event) => {
			this.close();
		});
	}

	close() {
		this.dialogRef.close();
	}

	exportToExcel() {
		const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(this.epltable.nativeElement);
		ws['!cols'] = [];
		ws['!cols'][1] = { hidden: true };
		const wb: xlsx.WorkBook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
		xlsx.writeFile(wb, 'epltable.xlsx');
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

	openShareDialog(): void {
		const dialogRef = this._dialog.open(WhatsappDialogComponent, {
			width: '250px',
			data: { whatsapp: this.customerdata.mobile },
		});

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
		});
	}
}
