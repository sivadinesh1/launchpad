import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DialogData } from '../invoice-success/invoice-success.component';

@Component({
    selector: 'app-search-invoice-no',
    templateUrl: './search-invoice-no.component.html',
    styleUrls: ['./search-invoice-no.component.scss'],
})
export class SearchInvoiceNoComponent {
    constructor(
        public dialogRef: MatDialogRef<SearchInvoiceNoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}
