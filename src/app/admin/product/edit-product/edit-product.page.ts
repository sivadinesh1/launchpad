import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { CommonApiService } from 'src/app/services/common-api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { patternValidator } from 'src/app/util/validators/pattern-validator';
import { HSNCODE_REGEX, DISC_REGEX } from 'src/app/util/helper/patterns';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.page.html',
  styleUrls: ['./edit-product.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditProductPage implements OnInit {
  isLinear = true;
  center_id: any;
  vendors$: Observable<any>;

  submitForm: FormGroup;

  productinfo: any;

  product_id: any;

  loading = false;
  currentStep: any;

  uom = [
    { key: 'Nos', viewValue: 'Nos' },
    { key: 'Kg', viewValue: 'Kg' },
    { key: 'Ltrs', viewValue: 'Ltrs' }
  ];

  constructor(private _formBuilder: FormBuilder, private _router: Router,
    private _route: ActivatedRoute, private _cdr: ChangeDetectorRef,
    private _commonApiService: CommonApiService,
    private _authservice: AuthenticationService) {
    this.currentStep = 0;

    this._route.params.subscribe(params => {
      this.center_id = params['centerid'];
      this.product_id = params['productid'];

      this._cdr.markForCheck();
    });


    this.vendors$ = this._commonApiService.getAllActiveVendors(_route.snapshot.params.centerid);

    this._cdr.markForCheck();

    this._commonApiService.viewProductInfo(_route.snapshot.params.centerid, _route.snapshot.params.productid).subscribe((data) => {
      this.productinfo = data[0];


      this.setFormValues();

      this._cdr.markForCheck();
    });

    this.submitForm = this._formBuilder.group({

      product_id: _route.snapshot.params.productid,
      center_id: _route.snapshot.params.centerid,
      product_code: [null, Validators.required],
      description: [null, Validators.required],
      vendorid: [null, Validators.required],


      unit: [null, Validators.required],
      packetsize: [null, Validators.required],
      hsncode: ['', [patternValidator(HSNCODE_REGEX)]],
      taxrate: [null, Validators.required],
      minqty: [null, Validators.required],

      unit_price: [null, Validators.required],
      mrp: [null, Validators.required],
      purchase_price: [null, Validators.required],
      salesprice: [null, Validators.required],
      maxdiscount: ['', [patternValidator(DISC_REGEX)]],

      currentstock: [null],
      rackno: [null],
      location: [null],
      alternatecode: [null],
      reorderqty: [null],
      avgpurprice: [null],
      avgsaleprice: [null],
      itemdiscount: [null],
      margin: [null],


    });

  }

  ngOnInit() {


  }


  setFormValues() {
    this.submitForm.patchValue({ 'product_code': this.productinfo.product_code });
    this.submitForm.patchValue({ 'description': this.productinfo.description });
    this.submitForm.patchValue({ 'vendorid': this.productinfo.vendor_id });

    this.submitForm.patchValue({ 'unit': this.productinfo.unit });
    this.submitForm.patchValue({ 'packetsize': this.productinfo.packetsize });
    this.submitForm.patchValue({ 'hsncode': this.productinfo.hsncode });
    this.submitForm.patchValue({ 'taxrate': this.productinfo.taxrate });
    this.submitForm.patchValue({ 'minqty': this.productinfo.minqty });

    this.submitForm.patchValue({ 'unit_price': this.productinfo.unit_price });
    this.submitForm.patchValue({ 'mrp': this.productinfo.mrp });
    this.submitForm.patchValue({ 'purchase_price': this.productinfo.purchase_price });
    this.submitForm.patchValue({ 'salesprice': this.productinfo.salesprice });
    this.submitForm.patchValue({ 'maxdiscount': this.productinfo.maxdiscount });
    this.submitForm.patchValue({ 'currentstock': this.productinfo.currentstock });
    this.submitForm.patchValue({ 'rackno': this.productinfo.rackno });
    this.submitForm.patchValue({ 'location': this.productinfo.location });
    this.submitForm.patchValue({ 'alternatecode': this.productinfo.alternatecode });
    this.submitForm.patchValue({ 'reorderqty': this.productinfo.reorderqty });
    this.submitForm.patchValue({ 'avgpurprice': this.productinfo.avgpurprice });
    this.submitForm.patchValue({ 'avgsaleprice': this.productinfo.avgsaleprice });
    this.submitForm.patchValue({ 'itemdiscount': this.productinfo.itemdiscount });
    this.submitForm.patchValue({ 'margin': this.productinfo.margin });

    this._cdr.markForCheck();
  }


  submit() {

    this._commonApiService.updateProduct(this.submitForm.value).subscribe((data: any) => {
      console.log('object... update successful');

      if (data.body.result === 'success') {
        this.searchProducts();
      }

    });


  }

  addProduct() {
    this._router.navigate([`/home/product/add`]);
  }




  searchProducts() {
    this._router.navigate([`/home/view-products`]);

  }


}
