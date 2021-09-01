import { Component, OnInit, Inject, ViewChild, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonApiService } from 'src/app/services/common-api.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import printJS from 'print-js';

@Component({
	selector: 'app-enquiry-print',
	templateUrl: './enquiry-print.component.html',
	styleUrls: ['./enquiry-print.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnquiryPrintComponent implements OnInit {
	paletteColour: any;
	isPrint = true;
	data: any;
	selPrintType = 'estimateprint';
	submitForm: FormGroup;
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
		private dialogRef: MatDialogRef<EnquiryPrintComponent>,
		@Inject(MAT_DIALOG_DATA) public rawdata: any,
		private fb: FormBuilder,
		private _commonApiService: CommonApiService,
		private _cdr: ChangeDetectorRef,
	) {
		this.data = rawdata;
		this.printcount = rawdata.print_count;

		this.submitForm = this.fb.group({
			printtype: ['estimateprint', Validators.required],
		});
	}

	ngOnInit() {}

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
		this.printEstimate('view');
	}

	print() {
		this.printEstimate('print');
	}

	printEstimate(action) {
		this.isPrint = true;

		if (this.selPrintType === 'estimateprint') {
			let submitForm = {
				sale_id: this.data.id,
				print_type: ['Original for Buyer'],
			};

			this._commonApiService.printEstimate(submitForm).subscribe((data: any) => {
				console.log('object...PRINTED');

				const blob = new Blob([data], { type: 'application/pdf' });

				// dnd to open in new tab - does not work with pop up blocked
				var link = document.createElement('a');
				link.href = window.URL.createObjectURL(blob);

				if (action === 'print') {
					printJS({
						printable: link.href,
						type: 'pdf',
					});
					this.printCounterCallback();
				} else {
					link.target = '_blank';
					link.click();
				}
			});
		} else {
			let submitForm = {
				sale_id: this.data.id,
				print_type: this.selectedoptionArr,
			};

			this._commonApiService.printInvoice(submitForm).subscribe((data: any) => {
				console.log('object...PRINTED');

				const blob = new Blob([data], { type: 'application/pdf' });

				// dnd to open in new tab - does not work with pop up blocked
				var link = document.createElement('a');
				link.href = window.URL.createObjectURL(blob);

				if (action === 'print') {
					printJS({
						printable: link.href,
						type: 'pdf',
					});
					this.printCounterCallback();
				} else {
					link.target = '_blank';
					link.click();
				}
			});
		}
	}

	printTypeChange(event) {
		if (event.value === 'estimateprint') {
			this.selPrintType = 'estimateprint';
		} else {
			this.selPrintType = 'stockissueprint';
		}
	}

	printCounterCallback() {
		this._commonApiService.getPrintCounterAfterUpdate(this.data.id).subscribe((data: any) => {
			this.printcount = data[0].print_count;
			this._cdr.markForCheck();
		});
	}
}

export interface DialogData {
	animal: string;
	name: string;
}
