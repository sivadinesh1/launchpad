import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';


@Component({
  selector: 'app-sale-return-receive',
  templateUrl: './sale-return-receive.component.html',
  styleUrls: ['./sale-return-receive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class SaleReturnReceiveComponent implements OnInit {

  salemasterdata: any;
  salereturndetailsdata: any;
  customerdata: any;
  centerdata: any;

  data: any;
  returnArr = [];


  submitForm: FormGroup;

  constructor(private _cdr: ChangeDetectorRef, private _router: Router,
    private _formBuilder: FormBuilder, private dialogRef: MatDialogRef<SaleReturnReceiveComponent>,
    private _route: ActivatedRoute, private _authservice: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) data: any, public _dialog: MatDialog, private _fb: FormBuilder,
    private _commonApiService: CommonApiService) {
    this.data = data;

  }

  ngOnInit() {
    this._commonApiService.getSaleReturnDetailsData(this.data.center_id, this.data.sale_return_id).subscribe((data: any) => {
      this.salereturndetailsdata = data;

      this.salereturndetailsdata.forEach(element => {
        this.processItems(element);
      });




      this._cdr.markForCheck();
    })
  }

  processItems(element) {
    this.returnArr.push(
      {
        "id": element.id,
        "sale_return_id": element.sale_return_id,
        "product_code": element.product_code,
        "description": element.description,
        "return_qty": element.return_qty,
        "received_qty": element.received_qty,
        "received_now": element.return_qty - element.received_qty
      });
  }


  update_change(event$, idx) {

    this.returnArr[idx].received_now = event$.target.value;
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
    //dialogConfig.data = row;
    dialogConfig.position = { top: '0', right: '0' };

    const dialogRef = this._dialog.open(SaleReturnReceiveComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  search() {
    console.log('object...' + this.returnArr);

    this._commonApiService.updateSaleReturnReceived(this.returnArr).subscribe((data: any) => {
      console.log('object...' + data);

      if (data.result === 'success') {
        this.dialogRef.close("success");
      }
    });

  }

  cancel() {
    this.dialogRef.close();
  }

}
