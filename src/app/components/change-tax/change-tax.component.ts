
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PhoneValidator } from 'src/app/util/validators/phone.validator';

@Component({
  selector: 'app-change-tax',
  templateUrl: './change-tax.component.html',
  styleUrls: ['./change-tax.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeTaxComponent implements OnInit {

  resultList: any;
  noMatch: any;



  pArry;
  rArry;

  product_id: any;

  submitForm: FormGroup;

  taxList = [{ "id": "0", "value": "0 %" }, { "id": "5", "value": "5 %" },
  { "id": "12", "value": "12 %" }, { "id": "18", "value": "18 %" }, { "id": "28", "value": "28 %" }]

  constructor(private _commonApiService: CommonApiService, private _modalcontroller: ModalController,
    private _cdr: ChangeDetectorRef,
  ) {



    this.submitForm = new FormGroup({
      tax: new FormControl('', Validators.compose([Validators.max(50), Validators.min(0), Validators.required])),
    });


  }

  ngOnInit() { }



  ionViewDidEnter() {
    let list = this.pArry;
    let removeList = this.rArry;



    this.rArry.forEach((e) => {

      this.product_id = this.pArry[e].product_id;
    });

    console.log('object A >> ' + JSON.stringify(this.pArry));
    console.log('object X >> ' + JSON.stringify(this.rArry));

  }

  async applyOnce() {

    if (!this.submitForm.valid) {
      return false;
    }

    await this._modalcontroller.dismiss(this.submitForm.value.tax);
  }

  async permanentTaxChange() {

    if (!this.submitForm.valid) {
      return false;
    }

    this._commonApiService.updateTax({ productid: this.product_id, taxrate: this.submitForm.value.tax }).subscribe(
      data => {
        this.resultList = data;
      }
    );



    await this._modalcontroller.dismiss(this.submitForm.value.tax);
  }


  closeModal() {
    this._modalcontroller.dismiss();
  }


}
