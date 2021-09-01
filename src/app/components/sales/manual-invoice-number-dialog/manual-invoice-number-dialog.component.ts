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
import { firstValueFrom } from 'rxjs';

@Component({
	selector: 'app-manual-invoice-number-dialog',
	templateUrl: './manual-invoice-number-dialog.component.html',
	styleUrls: ['./manual-invoice-number-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualInvoiceNumberDialogComponent implements OnInit {
	salemasterdata: any;
	saledetailsdata: any;
	customerdata: any;

	responsemsg: any;

	data: any;

	@ViewChild('epltable', { static: false }) epltable: ElementRef;
	model: any = {};

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<ManualInvoiceNumberDialogComponent>,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		@Inject(MAT_DIALOG_DATA) data: any,
		public _dialog: MatDialog,
		private _commonApiService: CommonApiService,
	) {
		this.data = data;
	}

	ngOnInit() {
		this.dialogRef.keydownEvents().subscribe((event) => {
			if (event.key === 'Escape') {
				this.close('');
			}
		});

		this.dialogRef.backdropClick().subscribe((event) => {
			this.close('');
		});
	}

	close(param) {
		this.dialogRef.close(param);
	}

	async onSubmit() {
		console.log('dinesh ' + JSON.stringify(this.model));
		this.responsemsg = '';

		let submitForm = {
			invoice_no: this.model.invoiceNo,
			center_id: this.data.center_id,
		};

		let result = await firstValueFrom(this._commonApiService.getDuplicateInvoiceNoCheked(submitForm));

		if (+result.body > 0) {
			this.responsemsg = 'Invoice# already present. Try another number';
			this._cdr.markForCheck();
		} else {
			this.close(this.model.invoiceNo);
		}
	}
}
