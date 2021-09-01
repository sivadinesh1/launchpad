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

import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';

import * as xlsx from 'xlsx';

@Component({
	selector: 'app-show-vendor-statement',
	templateUrl: './show-vendor-statement.component.html',
	styleUrls: ['./show-vendor-statement.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowVendorStatementComponent implements OnInit {
	statementdata: any;

	data: any;
	openingbalance: any;
	closingbalance: any;

	@ViewChild('epltable', { static: false }) epltable: ElementRef;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<ShowVendorStatementComponent>,
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
			.getVendorStatement(this.data)
			.subscribe((data: any) => {
				this.statementdata = data.body;

				if (this.statementdata[0].txn_type === 'purchase') {
					this.openingbalance =
						this.statementdata[0].balance_amt -
						this.statementdata[0].credit_amt;
				} else if (this.statementdata[0].txn_type === 'Payment') {
					this.openingbalance =
						this.statementdata[0].balance_amt - this.statementdata[0].debit_amt;
				}

				this.closingbalance = this.statementdata[0].balance_amt;

				this._cdr.markForCheck();
			});
	}

	close() {
		this.dialogRef.close();
	}

	exportToExcel() {
		const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(
			this.epltable.nativeElement
		);
		ws['!cols'] = [];
		ws['!cols'][1] = { hidden: true };
		const wb: xlsx.WorkBook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
		xlsx.writeFile(wb, 'epltable.xlsx');
	}
}
