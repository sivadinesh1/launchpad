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
import * as moment from 'moment';

@Component({
	selector: 'app-show-statement',
	templateUrl: './show-statement.component.html',
	styleUrls: ['./show-statement.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowStatementComponent implements OnInit {
	statementdata = [];

	data: any;
	openingbalance: any;
	closingbalance: any;

	@ViewChild('epltable', { static: false }) epltable: ElementRef;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<ShowStatementComponent>,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		@Inject(MAT_DIALOG_DATA) data: any,
		public _dialog: MatDialog,
		private _commonApiService: CommonApiService,
	) {
		this.data = data;
	}

	ngOnInit() {
		this._commonApiService.getCustomerStatement(this.data).subscribe((data: any) => {
			this.statementdata = data.body;

			this._cdr.markForCheck();
		});

		this._commonApiService.getCustomerClosingBalanceStatement(this.data).subscribe((data: any) => {
			this.closingbalance = data.body[0].balance;
			this._cdr.markForCheck();
		});

		this._commonApiService.getCustomerOpeningBalanceStatement(this.data).subscribe((data: any) => {
			this.openingbalance = data.body[0].balance;
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

		const wb: xlsx.WorkBook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
		xlsx.writeFile(wb, 'statement.xlsx');
	}

	// 	tasks.forEach( task => task.start_date = task.start_date.format("YYYY-MM-DD") );
	// return tasks;

	reformatRefDate(reportData) {
		reportData.forEach((element) => {
			element['ref_date_f'] = moment(element['ref_date_f']).format('DD-MM-YYYY');
		});
		return reportData;
	}

	exportCustomerStatement() {
		const fileName = 'Customer_Statement_Reports.xlsx';

		let reportData = JSON.parse(JSON.stringify(this.statementdata));

		reportData = this.reformatRefDate(reportData);

		reportData.forEach((e) => {
			delete e['customer'];
			delete e['place'];
		});

		const wb1: xlsx.WorkBook = xlsx.utils.book_new();
		//create sheet with empty json/there might be other ways to do this
		const ws1 = xlsx.utils.json_to_sheet([]);
		xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');
		//then add ur Title txt
		xlsx.utils.sheet_add_json(
			wb1.Sheets.sheet1,
			[
				{
					header: 'Customer Statement Reports',
					fromdate: `From: ${moment(this.data.startdate).format('DD/MM/YYYY')}`,
					todate: `To: ${moment(this.data.enddate).format('DD/MM/YYYY')}`,
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

	goPrintInvoice(row) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '400px';

		dialogConfig.data = row.id;

		const dialogRef = this._dialog.open(InvoiceSuccessComponent, dialogConfig);

		dialogRef.afterClosed();
	}
}

// Received_Amount: ""
// customer: "Saran Auto Spares"
// invoice_amount: "17634.00"
// place: "Tirunelveli - 627806"
// ref_date_f: "2021-03-31T18:30:00.000Z"
// refn: "21/04/00010"
// type: "Invoice"
