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
	selector: 'app-enquiry-view-dialog',
	templateUrl: './enquiry-view-dialog.component.html',
	styleUrls: ['./enquiry-view-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnquiryViewDialogComponent implements OnInit {
	enquirymasterdata: any;
	enquirydetailsdata = [];

	centerdata: any;

	data: any;

	@ViewChild('epltable', { static: false }) epltable: ElementRef;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<EnquiryViewDialogComponent>,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		@Inject(MAT_DIALOG_DATA) data: any,
		public _dialog: MatDialog,
		private _commonApiService: CommonApiService
	) {
		this.data = data;
	}

	ngOnInit() {
		this._commonApiService.getEnquiryMaster(this.data.id).subscribe((data: any) => {
			this.enquirymasterdata = data[0];
			this._cdr.markForCheck();
		});

		this._commonApiService.getEnquiryDetails(this.data.id).subscribe((data: any) => {
			this.enquirydetailsdata = data.enquiryDetails;

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
		ws['!cols'][4] = { hidden: true };

		const wb: xlsx.WorkBook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
		xlsx.writeFile(wb, 'epltable.xlsx');
	}

	// socialShare() {
	//   // let url = `https://api.whatsapp.com/send?phone=${this.customerdata.mobile}&text=Dear Sir, Your order of ${this.saledetailsdata.length} items, Invoice value ${this.salemasterdata.net_total} is ready for shipping.}`;
	//   // window.open(url, "_blank");
	// }

	openShareDialog(): void {
		const dialogRef = this._dialog.open(WhatsappDialogComponent, {
			width: '250px',
			data: { whatsapp: this.enquirymasterdata.mobile },
		});

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
		});
	}
}
