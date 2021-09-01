
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-whatsapp-dialog',
  templateUrl: './whatsapp-dialog.component.html',
  styleUrls: ['./whatsapp-dialog.component.scss'],
})
export class WhatsappDialogComponent implements OnInit {

  dataInfo: any;
  message: any;

  constructor(
    public dialogRef: MatDialogRef<WhatsappDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.dataInfo = data;
  }

  ngOnInit() { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onShareClick() {
    let url = `https://api.whatsapp.com/send?phone=${this.dataInfo.whatsapp}&text=${this.message}`;
    window.open(url, "_blank");
    this.dialogRef.close();
  }


}



