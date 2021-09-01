import { Component, OnInit, Inject, ViewChild, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonApiService } from 'src/app/services/common-api.service';
import printJS from 'print-js';

@Component({
	selector: 'app-invoice-success',
	templateUrl: './invoice-success.component.html',
	styleUrls: ['./invoice-success.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceSuccessComponent implements OnInit {
	paletteColour: any;
	isPrint = true;
	data: any;
	checked = false;

	printcount = 0;

	selectedoptionArr = ['Original for Buyer', 'Duplicate For Transporter'];

	checkbox_list = [
		{
			name: 'Original for Buyer',
			disabled: false,
			checked: true,
			labelPosition: 'after',
		},
		{
			name: 'Duplicate For Transporter',
			disabled: false,
			checked: true,
			labelPosition: 'after',
		},
		{
			name: 'Triplicate for Assessee',
			disabled: false,
			checked: false,
			labelPosition: 'after',
		},
		{
			name: 'Duplicate',
			disabled: false,
			checked: false,
			labelPosition: 'after',
		},
	];

	constructor(
		private dialogRef: MatDialogRef<InvoiceSuccessComponent>,
		@Inject(MAT_DIALOG_DATA) public rawdata: any,
		private _commonApiService: CommonApiService,
		private _cdr: ChangeDetectorRef,
	) {
		this.data = rawdata;
		this.printcount = rawdata.print_count;
	}

	ngOnInit() {
		this.dialogRef.keydownEvents().subscribe((event) => {
			if (event.key === 'Escape') {
				this.cancel();
			}
		});

		this.dialogRef.backdropClick().subscribe((event) => {
			this.cancel();
		});
	}

	ngAfterViewInit() {
		this.printCounter();
		this._cdr.markForCheck();
	}

	cancel() {
		this.dialogRef.close();
	}

	list_change() {
		this.selectedoptionArr = [];

		//Get total checked items
		for (let value of Object.values(this.checkbox_list)) {
			if (value.checked) {
				this.selectedoptionArr.push(value.name);
			}
		}
	}

	view() {
		this.printActn('view');
	}

	print() {
		this.printActn('print');
	}

	printActn(action) {
		this.isPrint = true;

		let submitForm = {
			sale_id: this.data.id,
			print_type: this.selectedoptionArr,
			print_ship_to: this.checked,
		};

		this._commonApiService.printInvoice(submitForm).subscribe((data: any) => {
			console.log('object...PRINTED');

			const blob = new Blob([data], { type: 'application/pdf' });

			// to save as file in ionic projects dnd
			// FileSaver.saveAs(blob, '_export_' + new Date().getTime() + '.pdf');

			// dnd - opens as iframe and ready for print (opens with print dialog box)
			// const blobUrl = URL.createObjectURL(blob);
			// const iframe = document.createElement('iframe');
			// iframe.style.display = 'none';
			// iframe.src = blobUrl;
			// document.body.appendChild(iframe);
			// iframe.contentWindow.print();

			// dnd to open in new tab - does not work with pop up blocked
			var link = document.createElement('a');
			link.href = window.URL.createObjectURL(blob);

			if (action === 'view') {
				link.target = '_blank';
				link.click();
			} else if (action === 'print') {
				printJS({
					printable: link.href,
					type: 'pdf',
				});
				this.printCounterCallback();
			}

			// if need to download with file name
			//  link.download = "filename.ext"

			// dnd - if need to do anyhting on click - not much use
			// link.onclick = function () {
			//   window.open(window.URL.createObjectURL(blob),
			//     '_blank',
			//     'width=300,height=250');
			//   return false;
			// };

			// var newWin = window.open(url);
			// if(!newWin || newWin.closed || typeof newWin.closed=='undefined')
			// {
			//POPUP BLOCKED
			// }
		});
	}

	printEstimate() {
		this.isPrint = true;

		let submitForm = {
			sale_id: this.data.invoice_id,
			print_type: this.selectedoptionArr,
		};

		this._commonApiService.printEstimate(submitForm).subscribe((data: any) => {
			console.log('object...PRINTED');

			const blob = new Blob([data], { type: 'application/pdf' });

			// to save as file in ionic projects dnd
			// FileSaver.saveAs(blob, '_export_' + new Date().getTime() + '.pdf');

			// dnd - opens as iframe and ready for print (opens with print dialog box)
			// const blobUrl = URL.createObjectURL(blob);
			// const iframe = document.createElement('iframe');
			// iframe.style.display = 'none';
			// iframe.src = blobUrl;
			// document.body.appendChild(iframe);
			// iframe.contentWindow.print();

			// dnd to open in new tab - does not work with pop up blocked
			var link = document.createElement('a');
			link.href = window.URL.createObjectURL(blob);
			link.target = '_blank';
			link.click();
			// if need to download with file name
			//  link.download = "filename.ext"

			// dnd - if need to do anyhting on click - not much use
			// link.onclick = function () {
			//   window.open(window.URL.createObjectURL(blob),
			//     '_blank',
			//     'width=300,height=250');
			//   return false;
			// };

			// var newWin = window.open(url);
			// if(!newWin || newWin.closed || typeof newWin.closed=='undefined')
			// {
			//POPUP BLOCKED
			// }
		});
	}

	printCounterCallback() {
		this._commonApiService.getPrintCounterAfterUpdate(this.data.id).subscribe((data: any) => {
			this.printcount = data[0].print_count;
			this._cdr.markForCheck();
		});
	}

	printCounter() {
		this._commonApiService.getPrintCounter(this.data.id).subscribe((data: any) => {
			this.printcount = data[0].print_count;
			this._cdr.markForCheck();
		});
	}
}

export interface DialogData {
	animal: string;
	name: string;
}
