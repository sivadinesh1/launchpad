import { Component, OnInit, Inject, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonApiService } from 'src/app/services/common-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-convert-to-sale-dialog',
  templateUrl: './convert-to-sale-dialog.component.html',
  styleUrls: ['./convert-to-sale-dialog.component.scss'],
})
export class ConvertToSaleDialogComponent implements OnInit {
  paletteColour: any;
  isPrint = false;
  data: any;

  constructor(private dialogRef: MatDialogRef<ConvertToSaleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataInput: any, private _router: Router,
    private _commonApiService: CommonApiService) {
    this.data = dataInput;
  }

  ngOnInit() { }

  cancel() {
    this.dialogRef.close();
    this._router.navigateByUrl('/home/search-sales');
  }

  close() {
    this._router.navigateByUrl('/home/search-sales');
    this.dialogRef.close('close');
  }



}

