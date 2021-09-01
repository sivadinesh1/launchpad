import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.page.html',
  styleUrls: ['./view-product.page.scss'],
})
export class ViewProductPage implements OnInit {

  productinfo: any;

  center_id: any;
  product_id: any;

  constructor(private _cdr: ChangeDetectorRef, private _commonApiService: CommonApiService,
    private _route: ActivatedRoute, private _router: Router,
  ) {

    this._route.params.subscribe(params => {
      this.center_id = params['center_id'];
      this.product_id = params['product_id'];

      this._cdr.markForCheck();
    });

  }

  ngOnInit() {

    this.productinfo = this._commonApiService
      .viewProductInfo(this.center_id, this.product_id).subscribe((data: any) => {

        this.productinfo = data[0] || [];
        console.log('object...@@.' + data);
        this._cdr.markForCheck();
      });
  }

  addProduct() {
    this._router.navigate([`/home/product/add`]);
  }

  editProduct() {
    this._router.navigate([`/home/product/edit`, `${this.center_id}`, `${this.product_id}`]);
  }

}
