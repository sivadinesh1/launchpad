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
import { SaleReturnReceiveComponent } from '../sale-return-receive/sale-return-receive.component';

@Component({
  selector: 'app-sale-return-view',
  templateUrl: './sale-return-view.component.html',
  styleUrls: ['./sale-return-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class SaleReturnViewComponent implements OnInit {

  salemasterdata: any;
  salereturndetailsdata: any;
  customerdata: any;
  centerdata: any;

  data: any;
  showReceiveButton = true;

  @ViewChild('epltable', { static: false }) epltable: ElementRef;

  constructor(private _cdr: ChangeDetectorRef, private _router: Router,
    private _formBuilder: FormBuilder, private dialogRef: MatDialogRef<SaleReturnViewComponent>,
    private _route: ActivatedRoute, private _authservice: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) data: any, public _dialog: MatDialog,
    private _commonApiService: CommonApiService) {
    this.data = data;

  }

  ngOnInit() {



    this._commonApiService.getSaleReturnDetailsData(this.data.center_id, this.data.sale_return_id).subscribe((data: any) => {
      this.salereturndetailsdata = data;
      this._cdr.markForCheck();
    })

    this._commonApiService.showReceiveButton(this.data.center_id, this.data.sale_return_id).subscribe((data: any) => {
      this.showReceiveButton = data[0].cnt === 0 ? false : true;

      this._cdr.markForCheck();
    })




  }


  close() {
    this.dialogRef.close();
  }









  salesReturnReceive(): void {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "50%";
    dialogConfig.height = "100%";
    dialogConfig.data = this.data;
    dialogConfig.position = { top: '0', right: '0' };

    const dialogRef = this._dialog.open(SaleReturnReceiveComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.dialogRef.close("success");
    });
  }


}
