import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-success-message-dialog',
  templateUrl: './success-message-dialog.component.html',
  styleUrls: ['./success-message-dialog.component.scss'],
})
export class SuccessMessageDialogComponent implements OnInit {
  message: any;

  constructor(@Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<SuccessMessageDialogComponent>,) {

    this.message = data;
  }

  ngOnInit() { }

  close() {
    this.dialogRef.close();
  }

}
