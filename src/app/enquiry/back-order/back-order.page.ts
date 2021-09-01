import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-order',
  templateUrl: './back-order.page.html',
  styleUrls: ['./back-order.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackOrderPage implements OnInit {

  center_id: any;
  back_order_lst: any;

  constructor(private _commonApiService: CommonApiService, private _authservice: AuthenticationService,
    private _router: Router, private _cdr: ChangeDetectorRef) {
    const currentUser = this._authservice.currentUserValue;
    this.center_id = currentUser.center_id;
  }

  ngOnInit() {
    this._commonApiService.getBackOder(this.center_id).subscribe((data: any) => {
      this.back_order_lst = data;
      this._cdr.markForCheck();
    });

  }


  productInfo(item) {

    if (item.product_code != 'N/A') {
      this._router.navigate([`/home/view-product/${this.center_id}/${item.product_id}`]);
    }

  }

}
