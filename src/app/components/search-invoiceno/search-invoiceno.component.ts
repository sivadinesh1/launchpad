import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DialogData } from '../invoice-success/invoice-success.component';

@Component({
  selector: 'app-search-invoiceno',
  templateUrl: './search-invoiceno.component.html',
  styleUrls: ['./search-invoiceno.component.scss'],
})
export class SearchInvoicenoComponent {
  constructor(
    public dialogRef: MatDialogRef<SearchInvoicenoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
