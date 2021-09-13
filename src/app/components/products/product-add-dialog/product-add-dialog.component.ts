import { User } from '../../../models/User';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { throwError, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonApiService } from 'src/app/services/common-api.service';
import {
  HSNCODE_REGEX,
  DISC_REGEX,
  TWO_DECIMAL_REGEX,
} from 'src/app/util/helper/patterns';
import { patternValidator } from 'src/app/util/validators/pattern-validator';

import { MessagesService } from '../../../components/messages/messages.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { MatDialogRef } from '@angular/material/dialog';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-product-add-dialog',
  templateUrl: './product-add-dialog.component.html',
  styleUrls: ['./product-add-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAddDialogComponent implements OnInit {
  isLinear = true;
  center_id: any;
  brands: any;

  submitForm: FormGroup;
  pexists = false;
  prod_code: any;

  temppcode: any;
  userdata$: Observable<User>;
  userdata: any;
  responsemsg: any;

  uom = [
    { key: 'Nos', viewValue: 'Nos' },
    { key: 'Kg', viewValue: 'Kg' },
    { key: 'Ltrs', viewValue: 'Ltrs' },
  ];

  tax = [
    { key: '0', viewValue: '0' },
    { key: '5', viewValue: '5' },
    { key: '12', viewValue: '12' },
    { key: '18', viewValue: '18' },
    { key: '28', viewValue: '28' },
  ];

  constructor(
    private _formBuilder: FormBuilder,
    private _commonApiService: CommonApiService,
    private _cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<ProductAddDialogComponent>,
    private _router: Router,
    private _loadingService: LoadingService,
    private _authservice: AuthenticationService
  ) {
    this.submitForm = this._formBuilder.group({
      center_id: [],
      product_code: ['', Validators.required],
      description: ['', Validators.required],
      brand_id: ['', Validators.required],

      unit: ['', Validators.required],
      packetsize: ['', Validators.required],
      hsncode: [''],

      taxrate: ['', Validators.required],
      minqty: [0, Validators.required],

      unit_price: [''],
      mrp: ['', Validators.required],
      purchase_price: ['', Validators.required],
      maxdiscount: [''],
      salesprice: [''],

      currentstock: [0],
      rackno: [''],
      location: [''],
      alternatecode: [''],
      reorderqty: [0],
      avgpurprice: [0],
      avgsaleprice: [0],
      itemdiscount: [0],
      margin: [0],
    });

    this.userdata$ = this._authservice.currentUser;
    this.userdata$
      .pipe(filter((data) => data !== null))
      .subscribe((data: any) => {
        this.userdata = data;
        this.center_id = this.userdata.center_id;
        this.submitForm.patchValue({
          center_id: this.userdata.center_id,
        });

        this._commonApiService.getAllActiveBrands('A').subscribe((data) => {
          this.brands = data;
        });

        this._cdr.markForCheck();
      });
  }

  ngOnInit() {
    this.dialogRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    });

    this.dialogRef.backdropClick().subscribe((event) => {
      this.close();
    });
  }

  onSubmit() {
    if (!this.submitForm.valid) {
      this.responsemsg = 'Missing required field(s).';
      this._cdr.markForCheck();
      return false;
    } else {
      // assign PP to UP (until strong use case arise)
      this.submitForm.patchValue({
        unit_price: this.submitForm.value.purchase_price,
      });
    }

    this.checkAndAdd();
  }

  checkAndAdd() {
    this.pexists = false;

    if (this.submitForm.value.product_code.length > 0) {
      this._commonApiService
        .isProdExists(this.submitForm.value.product_code)
        .subscribe((data: any) => {
          if (data.length > 0 && data[0].id > 0) {
            this.pexists = true;
            this.temppcode = data.result[0];
            this.responsemsg = 'Duplicate Product Code';
          } else {
            this.addProduct();
            this.pexists = false;
          }

          this._cdr.markForCheck();
        });
    }
  }

  addProduct() {
    this._commonApiService
      .addProduct(this.submitForm.value)
      .subscribe((data: any) => {
        console.log('successfullly inserted product >>>');

        if (data.body.affectedRows === 1) {
          this.dialogRef.close('success');
        }
      });
  }

  goProdEdit() {
    this._router.navigate([
      `/home/product/edit/${this.temppcode.center_id}/${this.temppcode.id}`,
    ]);
  }

  close() {
    this.dialogRef.close();
  }
}
