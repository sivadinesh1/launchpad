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
import { InventoryReportsDialogComponent } from '../reports/inventory-reports-dialog/inventory-reports-dialog.component';

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
  isCLoading = false;
  customer_lis: Customer[];
  product_lis: Product[];
  listArr = [];

  searchByLbl: string;

  constructor(
    private _authservice: AuthenticationService,
    private _modalcontroller: ModalController,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private _commonApiService: CommonApiService,
    private _fb: FormBuilder
  ) {
    this.searchByLbl = 'Inventory';

    this.userdata$ = this._authservice.currentUser;

    this.userdata$
      .pipe(filter((data) => data !== null))
      .subscribe((data: any) => {
        this.userdata = data;
        this._cdr.markForCheck();
      });

    this.submitForm = this._fb.group({
      customerctrl: [null, [Validators.required, RequireMatch]],
      productctrl: [null],
    });
  }

  ngOnInit() {
    this.searchProducts();
    this.searchCustomers();
  }

  searchBy(param) {
    this.searchByLbl = param;
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

  searchCustomers() {
    this.submitForm.controls['customerctrl'].valueChanges
      .pipe(
        debounceTime(300),
        tap(() => (this.isCLoading = true)),
        switchMap((id: any) => {
          if (id != null && id.length !== undefined && id.length >= 2) {
            return this._commonApiService.getCustomerInfo({
              centerid: this.userdata.center_id,
              searchstr: id,
            });
          } else {
            return empty();
          }
        })
      )

      .subscribe((data: any) => {
        this.isCLoading = false;
        this.customer_lis = data.body;

        this._cdr.markForCheck();
      });
  }

  displayFn(obj: any): string | undefined {
    return obj && obj.name ? obj.name : undefined;
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

  clearCustomerInput() {
    this.submitForm.patchValue({
      customerctrl: null,
    });
    this.customer_lis = null;

    this._cdr.markForCheck();
  }

  // (click)="showInventoryReportsDialog(item.product_code, item.product_id)"

  async showTransactions(event, from) {
    let onlyProductCodeArr = this.listArr.map((element) => {
      return element.product_code;
    });

    if (from === 'tab') {
      this.showInventoryReportsDialog(event.product_code, event.product_id);
    } else {
      this.showInventoryReportsDialog(
        event.option.value.product_code,
        event.option.value.product_id
      );
    }
  }

  async showInventoryReportsDialog(product_code, product_id) {
    debugger;
    const modal = await this._modalcontroller.create({
      component: InventoryReportsDialogComponent,
      componentProps: {
        center_id: this.center_id,
        product_code: product_code,
        product_id: product_id,
      },
      cssClass: 'select-modal',
    });

    modal.onDidDismiss().then((result) => {
      this._cdr.markForCheck();
    });

    await modal.present();
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
