import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
} from '@angular/core';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { empty, Observable } from 'rxjs';
import { User } from '../../models/User';
import {
  filter,
  map,
  defaultIfEmpty,
  debounceTime,
  switchMap,
  tap,
} from 'rxjs/operators';
import { ModalController } from '@ionic/angular';

import { SearchDialogComponent } from '../search/search-dialog/search-dialog.component';
import { SettingsDialogComponent } from '../settings/settings-dialog/settings-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Customer } from 'src/app/models/Customer';
import { CommonApiService } from 'src/app/services/common-api.service';
import { RequireMatch } from 'src/app/util/directives/requireMatch';
import { Product } from 'src/app/models/Product';
import * as moment from 'moment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  userdata: any;
  center_id: any;

  userdata$: Observable<User>;

  public today = Date.now();
  filled = false;

  @Output()
  onHBMenuClick = new EventEmitter<any>();

  customerdata: any;

  submitForm: FormGroup;

  customername: string = '';
  customernameprint: string = '';

  isLoading = false;
  product_lis: Product[];
  listArr = [];

  constructor(
    private _authservice: AuthenticationService,
    private _modalcontroller: ModalController,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private _commonApiService: CommonApiService,
    private _fb: FormBuilder
  ) {
    this.userdata$ = this._authservice.currentUser;

    this.userdata$
      .pipe(filter((data) => data !== null))
      .subscribe((data: any) => {
        this.userdata = data;
        this._cdr.markForCheck();
      });

    this.submitForm = this._fb.group({
      productctrl: [null, [RequireMatch]],
    });
  }

  ngOnInit() {
    this.searchProducts();
  }

  searchProducts() {
    let invdt = '';
    if (this.submitForm.value.invoicedate === null) {
      invdt = moment().format('DD-MM-YYYY');
    } else {
      invdt = moment(this.submitForm.value.invoicedate).format('DD-MM-YYYY');
    }

    this.submitForm.controls['productctrl'].valueChanges
      .pipe(
        debounceTime(300),
        tap(() => (this.isLoading = true)),
        switchMap((id: any) => {
          if (id != null && id.length >= 1) {
            return this._commonApiService.getProductInformation({
              centerid: this.userdata.center_id,
              customerid: 1,
              orderdate: invdt,
              searchstr: id,
            });
          } else {
            return empty();
          }
        })
      )

      .subscribe((data: any) => {
        this.isLoading = false;
        this.product_lis = data.body;

        this._cdr.markForCheck();
      });
  }

  displayProdFn(obj: any): string | undefined {
    return obj && obj.product_code ? obj.product_code : undefined;
  }

  goAdmin() {
    this._router.navigate([`/home/admin`]);
  }

  clearProdInput() {
    this.submitForm.patchValue({
      productctrl: null,
    });
    this.product_lis = null;

    this._cdr.markForCheck();
  }

  async logout() {
    await this._authservice.logOut();
    this._router.navigateByUrl('');
  }

  viewProduct() {
    this._router.navigate([`/home/view-products`]);
  }

  viewVendor() {
    this._router.navigate([`/home/view-vendors`]);
  }

  viewBrand() {
    this._router.navigate([`/home/view-brands`]);
  }

  viewCustomer() {
    this._router.navigate([`/home/view-customers`]);
  }

  editCenter() {
    this._router.navigate([`/home/center/edit`, this.userdata.center_id]);
  }

  showNewEnquiry() {
    this._router.navigate([`/home/enquiry`]);
  }

  showCustomerStatement() {
    this._router.navigate([`/home/statement-reports`]);
  }

  showNewSales() {
    this._router.navigate([`home/sales/edit/0/TI`]);
  }

  viewDiscounts() {
    this._router.navigate(['/home/view-discounts']);
  }

  viewInventoryReports() {
    this._router.navigate(['home/reports/inventory-reports']);
  }

  viewProductSummaryReports() {
    this._router.navigate(['home/reports/product-summary-reports']);
  }

  viewUsers() {
    this._router.navigate(['home/users-list']);
  }

  goCustomers() {}

  async showAddProductComp() {
    const modal = await this._modalcontroller.create({
      component: SearchDialogComponent,
      componentProps: { center_id: this.userdata?.center_id, customer_id: 0 },
      cssClass: 'select-modal',
    });

    modal.onDidDismiss().then((result) => {
      console.log('The result:', result);
      this._cdr.markForCheck();
    });

    await modal.present();
  }

  openBackOrder() {
    this._router.navigateByUrl('/home/enquiry/back-order');
  }

  goAccountsScreen() {
    this._router.navigateByUrl(`/home/accounts/accounts-dash`);
  }

  async openSettings() {
    const modal = await this._modalcontroller.create({
      component: SettingsDialogComponent,
      componentProps: {
        center_id: this.userdata.center_id,
        role_id: this.userdata.role_id,
      },
      cssClass: 'select-modal',
    });

    modal.onDidDismiss().then((result) => {
      console.log('The result:', result);
      this._cdr.markForCheck();
    });

    await modal.present();
  }

  onclick() {
    this.onHBMenuClick.emit();
  }

  setCustomerInfo(event, from) {
    if (event !== undefined) {
      if (from === 'tab') {
        this.customerdata = event;

        this._cdr.detectChanges();
      } else {
        this.customerdata = event.option.value;

        this._cdr.detectChanges();
      }
    }
  }
}
