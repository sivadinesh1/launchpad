import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnInit,
    Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { empty, Observable } from 'rxjs';
import { debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { Customer } from 'src/app/models/Customer';
import { IProduct } from 'src/app/models/Product';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import { User } from '../../models/User';
import { InventoryReportsDialogComponent } from '../reports/inventory-reports-dialog/inventory-reports-dialog.component';
import { SearchDialogComponent } from '../search/search-dialog/search-dialog.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
    user_data: any;
    center_id: any;

    user_data$: Observable<User>;

    public today = Date.now();
    filled = false;

    @Output()
    onHBMenuClick = new EventEmitter<any>();

    customerdata: any;

    submitForm: FormGroup;

    customername = '';
    customernameprint = '';

    isLoading = false;
    isCLoading = false;
    customer_lis: Customer[];
    product_lis: IProduct[];
    listArr = [];

    searchByLbl: string;

    constructor(
        private _authService: AuthenticationService,
        private _modalcontroller: ModalController,
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _commonApiService: CommonApiService,
        private _fb: FormBuilder
    ) {
        this.searchByLbl = 'Inventory';

        this.user_data$ = this._authService.currentUser;

        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.user_data = data;
                this._cdr.markForCheck();
            });

        this.submitForm = this._fb.group({
            product_ctrl: [null],
        });
    }

    ngOnInit() {
        this.searchProducts();
    }

    searchBy(param) {
        this.searchByLbl = param;
    }

    searchProducts() {
        let invdt = '';
        if (this.submitForm.value.invoicedate === null) {
            invdt = moment().format('DD-MM-YYYY');
        } else {
            invdt = moment(this.submitForm.value.invoicedate).format(
                'DD-MM-YYYY'
            );
        }

        // check customer_id, empty
        this.submitForm.controls.product_ctrl.valueChanges
            .pipe(
                debounceTime(300),
                tap(() => (this.isLoading = true)),
                switchMap((id: any) => {
                    if (id != null && id.length >= 1) {
                        return this._commonApiService.getProductInformation({
                            center_id: this.user_data.center_id,
                            customerid: 1,
                            orderdate: invdt,
                            search_text: id,
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
            product_ctrl: null,
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

    async showTransactions(event, from) {
        if (from === 'tab') {
            this.showInventoryReportsDialog(
                event.product_code,
                event.product_id
            );
        } else {
            this.showInventoryReportsDialog(
                event.option.value.product_code,
                event.option.value.product_id
            );
        }
    }

    async showInventoryReportsDialog(product_code, product_id) {
        const modal = await this._modalcontroller.create({
            component: InventoryReportsDialogComponent,
            componentProps: {
                center_id: this.center_id,
                product_code,
                product_id,
            },
            cssClass: 'select-modal',
        });

        modal.onDidDismiss().then((result) => {
            this._cdr.markForCheck();
        });

        await modal.present();
    }

    showNewEnquiry() {
        this._router.navigate([`/home/enquiry`]);
    }

    showNewSales() {
        this._router.navigate([`home/sales/edit/0/TI`]);
    }

    customerInfoPage(item) {
        console.log('object.......' + JSON.stringify(item));

        this._router.navigate([`/home/financials-customer`], {
            state: { center_id: item.center_id, customer_id: item.id },
        });
    }

    onclick() {
        this.onHBMenuClick.emit();
    }
}
