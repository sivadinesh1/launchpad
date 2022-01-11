import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ViewChild,
    ElementRef,
    ViewChildren,
    QueryList,
    AfterViewInit,
} from '@angular/core';
import {
    ModalController,
    PickerController,
    AlertController,
} from '@ionic/angular';

import { CommonApiService } from '../services/common-api.service';
import {
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    FormArray,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CurrencyPadComponent } from '../components/currency-pad/currency-pad.component';

import { AuthenticationService } from '../services/authentication.service';
import { ChangeTaxComponent } from '../components/change-tax/change-tax.component';
import { ChangeMrpComponent } from '../components/change-mrp/change-mrp.component';
import { Route, ActivatedRoute, Router } from '@angular/router';
import { NullToQuotePipe } from '../util/pipes/null-quote.pipe';
import { filter, tap, debounceTime, switchMap } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

import { IProduct } from '../models/Product';
import { empty } from 'rxjs';
import { RequireMatch } from '../util/directives/requireMatch';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { IonContent } from '@ionic/angular';
import { VendorViewDialogComponent } from '../components/vendors/vendor-view-dialog/vendor-view-dialog.component';
import { Vendor } from '../models/Vendor';
import * as moment from 'moment';
import { VendorAddDialogComponent } from '../components/vendors/vendor-add-dialog/vendor-add-dialog.component';

import { Observable } from 'rxjs';
import { User } from '../models/User';

import { ChangeDetectionStrategy } from '@angular/core';
import { InventoryReportsDialogComponent } from '../components/reports/inventory-reports-dialog/inventory-reports-dialog.component';
@Component({
    selector: 'app-purchase',
    templateUrl: './purchase.page.html',
    styleUrls: ['./purchase.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchasePage implements OnInit, AfterViewInit {
    // TAB navigation for product list
    @ViewChild('typeHead', { read: MatAutocompleteTrigger })
    autoTrigger: MatAutocompleteTrigger;

    @ViewChild('plist', { static: true }) plist: any;
    @ViewChild('vList', { static: true }) v_list: any;

    @ViewChild('invNo', { static: false }) inputEl: ElementRef;
    @ViewChild('order_no', { static: false }) order_noEl: ElementRef;
    @ViewChildren('myCheckbox') myCheckboxes: QueryList<any>;

    @ViewChild('Qty', { static: true }) quantity: any;

    // TAB navigation for vendor list
    @ViewChild('typeHead1', { read: MatAutocompleteTrigger })
    autoTrigger1: MatAutocompleteTrigger;

    @ViewChild(IonContent, { static: false }) content: IonContent;

    bread_menu = 'New Purchase';
    vendor_name = '';
    vendor_state = '';

    listArr = [];

    total = '0.00';
    // items = Array.from({ length: 100000 }).map((_, i) => `Item #${i}`);
    // test1: any;
    vendor_state_code: any;
    // center_state_code: any
    i_gst: any;
    vendor_data: any;
    submitForm: FormGroup;

    vendor_selected: any;

    no_of_boxes: any;

    igs_t: any;
    cgs_t: any;
    sgs_t: any;

    igs_t_Total = '0.00';
    cgs_t_Total = '0.00';
    sgs_t_Total = '0.00';

    tax_percentage: any;
    after_tax_value: any;
    // center_id: any;

    removeRowArr = [];
    deletedRowArr = [];

    showDelIcon = false;
    singleRowSelected = false;
    // purchase_id: any;
    rawPurchaseData: any;

    maxDate = new Date();
    max_order_date = new Date();

    isVLoading = false;
    isLoading = false;

    // is_vendor_selected = false;
    vendor_lis: Vendor[];
    product_lis: IProduct[];
    lineItemData: any;

    user_data$: Observable<User>;
    user_data: any;
    clicked = false;

    selected_description = '';
    selected_mrp = '';
    orig_mrp = 0;

    ready = 0; // flag check - center_id (local_storage) & customer_id (param)

    draftConfirm = [
        {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
                console.log('Confirm Cancel: blah');
            },
        },
        {
            text: 'Save & Exit to Purchase Orders List',
            cssClass: 'secondary',
            handler: () => {
                console.log('Confirm Cancel: blah');
                this.mainSubmit('add', 'back');
            },
        },
        {
            text: 'Save & Continue',
            cssClass: 'primary',
            handler: () => {
                console.log('Confirm Okay');
                this.mainSubmit('add', 'stay');
            },
        },
    ];

    constructor(
        private _modalController: ModalController,

        public dialog: MatDialog,
        public alertController: AlertController,
        private _route: ActivatedRoute,
        private _router: Router,
        private _dialog: MatDialog,
        private _authService: AuthenticationService,
        private _snackBar: MatSnackBar,
        private _commonApiService: CommonApiService,
        private _fb: FormBuilder,
        private spinner: NgxSpinnerService,
        private _cdr: ChangeDetectorRef
    ) {
        this.user_data$ = this._authService.currentUser;
        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this._authService.setCurrentMenu('PURCHASE');
                this.user_data = data;

                this.ready = 1;

                // data change
                this._route.data.subscribe((data1) => {
                    this.clicked = false;
                    this.init();
                    this._authService.setCurrentMenu('PURCHASE');
                    this.listArr = [];
                    this.rawPurchaseData = data1.raw_purchase_data;
                });

                // param change
                this._route.params.subscribe((params) => {
                    this.clicked = false;
                    this.submitForm.patchValue({
                        center_id: data.center_id,
                    });

                    if (this.user_data !== undefined) {
                        this.initialize();
                        this.clearInput();
                        this.submitForm.patchValue({
                            center_id: this.user_data.center_id,
                        });
                    }
                });

                this._cdr.markForCheck();
            });
    }

    ngOnInit() {}
    initialize() {
        this.vendor_selected = false;

        // navigating from list purchase page
        this.buildRawPurchaseData();
    }

    buildRawPurchaseData() {
        if (
            this.rawPurchaseData[0] !== undefined &&
            this.rawPurchaseData[0].id !== 0
        ) {
            this.spinner.show();
            this.bread_menu = 'Edit Purchase #';

            this.submitForm.patchValue({
                purchase_id: this.rawPurchaseData[0].id,
                invoice_no: this.rawPurchaseData[0].invoice_no,
                invoice_date: new Date(
                    new NullToQuotePipe()
                        .transform(this.rawPurchaseData[0].invoice_date)
                        .replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')
                ),

                order_date:
                    this.rawPurchaseData[0].order_date === ''
                        ? ''
                        : new Date(
                              new NullToQuotePipe()
                                  .transform(this.rawPurchaseData[0].order_date)
                                  .replace(
                                      /(\d{2})-(\d{2})-(\d{4})/,
                                      '$2/$1/$3'
                                  )
                          ),

                lr_no: this.rawPurchaseData[0].lr_no,

                lr_date:
                    this.rawPurchaseData[0].lr_date === ''
                        ? ''
                        : new Date(
                              new NullToQuotePipe()
                                  .transform(this.rawPurchaseData[0].lr_date)
                                  .replace(
                                      /(\d{2})-(\d{2})-(\d{4})/,
                                      '$2/$1/$3'
                                  )
                          ),
                order_no: this.rawPurchaseData[0].order_no,
                no_of_boxes: this.rawPurchaseData[0].no_of_boxes,

                received_date:
                    this.rawPurchaseData[0].received_date === ''
                        ? ''
                        : new Date(
                              new NullToQuotePipe()
                                  .transform(
                                      this.rawPurchaseData[0].received_date
                                  )
                                  .replace(
                                      /(\d{2})-(\d{2})-(\d{4})/,
                                      '$2/$1/$3'
                                  )
                          ),

                no_of_items: this.rawPurchaseData[0].no_of_items,
                total_quantity: this.rawPurchaseData[0].total_quantity,
                value: this.rawPurchaseData[0].total_value,
                total_value: this.rawPurchaseData[0].total_value,
                igs_t: this.rawPurchaseData[0].igs_t,
                cgs_t: this.rawPurchaseData[0].cgs_t,
                sgs_t: this.rawPurchaseData[0].sgs_t,
                transport_charges: this.rawPurchaseData[0].transport_charges,
                unloading_charges: this.rawPurchaseData[0].unloading_charges,
                misc_charges: this.rawPurchaseData[0].misc_charges,
                net_total: this.rawPurchaseData[0].net_total,
                after_tax_value: this.rawPurchaseData[0].after_tax_value,
                status: this.rawPurchaseData[0].status,
                revision: this.rawPurchaseData[0].revision,
            });

            this._cdr.markForCheck();

            this._commonApiService
                .getVendorDetails(this.rawPurchaseData[0].vendor_id)
                .subscribe((vendData: any) => {
                    this.vendor_data = vendData[0];
                    this.vendor_state_code = vendData[0].code;

                    this.submitForm.patchValue({
                        vendor_ctrl: vendData[0],
                    });

                    this.vendor_name = vendData[0].name;
                    this.vendor_state = vendData[0].state;
                    this.vendor_selected = true;
                    this.setTaxLabel();
                    this.setTaxSegment(vendData[0].taxrate);

                    this._cdr.markForCheck();
                });

            this._commonApiService
                .purchaseDetails(this.rawPurchaseData[0].id)
                .subscribe((purchaseData: any) => {
                    this.spinner.hide();
                    const pData = purchaseData;

                    pData.forEach((element) => {
                        this.processItems(element, 'preload');
                    });
                });

            this._cdr.markForCheck();
        }
    }

    init() {
        this.submitForm = this._fb.group({
            center_id: [null],
            purchase_id: new FormControl('', Validators.required),
            vendor: new FormControl(null, Validators.required),
            invoice_no: new FormControl(null, Validators.required),
            invoice_date: new FormControl(null, Validators.required),
            order_no: new FormControl(''),
            order_date: new FormControl(''),
            lr_no: new FormControl(''),
            lr_date: new FormControl(''),
            no_of_boxes: new FormControl(0),
            received_date: new FormControl(''),
            no_of_items: new FormControl(0),
            total_quantity: new FormControl(0),
            value: new FormControl(0),
            total_value: new FormControl(0),
            igs_t: new FormControl(0),
            cgs_t: new FormControl(0),
            sgs_t: new FormControl(0),
            transport_charges: new FormControl(0),
            unloading_charges: new FormControl(0),
            misc_charges: new FormControl(0),
            net_total: new FormControl(0),
            after_tax_value: new FormControl(0),
            status: new FormControl('D'),

            vendor_ctrl: [null, [Validators.required, RequireMatch]],
            product_ctrl: [null, [RequireMatch]],
            temp_desc: [''],
            temp_purchase_price: [''],
            temp_mrp: [''],
            temp_quantity: [
                '1',
                [
                    Validators.required,
                    Validators.max(1000),
                    Validators.min(1),
                    Validators.pattern(/\-?\d*\.?\d{1,2}/),
                ],
            ],

            product_arr: new FormControl(null, Validators.required),
            roundoff: [0],
            revision: new FormControl(0),
        });

        this.searchVendors();
        this.searchProducts();
    }

    ngAfterViewInit() {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.autoTrigger &&
            this.autoTrigger.panelClosingActions.subscribe((x) => {
                if (
                    this.autoTrigger.activeOption &&
                    this.autoTrigger.activeOption.value !== undefined
                ) {
                    this.submitForm.patchValue({
                        product_ctrl: this.autoTrigger.activeOption.value,
                    });
                    this.setItemDesc(
                        this.autoTrigger.activeOption.value,
                        'tab'
                    );
                }
            });

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.autoTrigger1 &&
            this.autoTrigger1.panelClosingActions.subscribe((x) => {
                if (
                    this.autoTrigger1.activeOption &&
                    this.autoTrigger1.activeOption.value !== undefined
                ) {
                    this.submitForm.patchValue({
                        vendor_ctrl: this.autoTrigger1.activeOption.value,
                    });
                    this.setVendorInfo(
                        this.autoTrigger1.activeOption.value,
                        'tab'
                    );
                }
            });

        setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            this.v_list && this.v_list.nativeElement.focus();
            if (
                this.rawPurchaseData[0] !== undefined &&
                this.rawPurchaseData[0].id !== 0
            ) {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                this.plist && this.plist.nativeElement.focus();
            }
            this._cdr.detectChanges();
        }, 100);
    }

    clearInput() {
        this.submitForm.patchValue({
            vendor_ctrl: null,
        });

        this.vendor_selected = false;

        this._cdr.markForCheck();
    }

    searchVendors() {
        let search = '';
        this.submitForm.controls.vendor_ctrl.valueChanges
            .pipe(
                debounceTime(300),
                tap(() => (this.isVLoading = true)),
                switchMap((id: any) => {
                    console.log(id);
                    search = id;
                    if (id != null && id.length >= 2) {
                        return this._commonApiService.getVendorInfo({
                            center_id: this.user_data.center_id,
                            search_text: id,
                        });
                    } else {
                        return empty();
                    }
                })
            )

            .subscribe((data: any) => {
                this.isVLoading = false;
                this.vendor_lis = data.body;

                this._cdr.markForCheck();
            });
    }

    searchProducts() {
        let invDt = '';
        if (this.submitForm.value.invoice_date === null) {
            invDt = moment().format('DD-MM-YYYY');
        } else {
            invDt = moment(this.submitForm.value.invoice_date).format(
                'DD-MM-YYYY'
            );
        }

        this.submitForm.controls.product_ctrl.valueChanges
            .pipe(
                debounceTime(300),
                tap(() => (this.isLoading = true)),
                switchMap((id: any) => {
                    if (id != null && id.length >= 2) {
                        return this._commonApiService.getProductInfo({
                            center_id: this.user_data.center_id,
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

    // type/search product code
    async setItemDesc(event, from) {
        const onlyProductCodeArr = this.listArr.map(
            (element) => element.product_code
        );

        if (from === 'tab') {
            this.lineItemData = event;
        } else {
            this.lineItemData = event.option.value;
        }

        const is_duplicate = onlyProductCodeArr.includes(
            this.lineItemData.product_code
        );
        let proceed = false;

        if (is_duplicate) {
            const index = onlyProductCodeArr.indexOf(
                this.lineItemData.product_code
            );

            const alert = await this.alertController.create({
                header: 'Confirm!',
                message: `The Item already added ROW # (${
                    index + 1
                }). Do you want to add again?`,
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: (blah) => {
                            console.log('Confirm Cancel: blah');
                            this.clearProdInput();
                        },
                    },
                    {
                        text: 'Continue to Add',
                        handler: () => {
                            console.log('Confirm Okay');
                            proceed = true;
                            this.addLineItemData(event, from);
                        },
                    },
                ],
            });

            await alert.present();
        } else {
            this.addLineItemData(event, from);
        }
        this._cdr.markForCheck();
    }

    addLineItemData(event, from) {
        if (from === 'tab') {
            this.orig_mrp = event.mrp;
            this.submitForm.patchValue({
                temp_desc: event.description,
                temp_quantity: event.quantity === 0 ? 1 : event.quantity,
                temp_mrp: event.mrp,
                temp_purchase_price:
                    event.purchase_price === 'null'
                        ? '0'
                        : event.purchase_price === '0.00'
                        ? '0'
                        : event.purchase_price,
            });
            this.lineItemData = event;
            this.selected_description = event.description;
            this.selected_mrp = event.mrp;
        } else {
            this.orig_mrp = event.option.value.mrp;
            this.submitForm.patchValue({
                temp_desc: event.option.value.description,
                temp_quantity:
                    event.option.value.qty === 0
                        ? 1
                        : event.option.value.quantity,
                temp_mrp: event.option.value.mrp,
                temp_purchase_price:
                    event.option.value.purchase_price === 'null'
                        ? '0'
                        : event.option.value.purchase_price === '0.00'
                        ? '0'
                        : event.option.value.purchase_price,
            });
            this.lineItemData = event.option.value;
            this.selected_description = event.option.value.description;
            this.selected_mrp = event.option.value.mrp;

            setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                this.quantity && this.quantity.nativeElement.focus();
                // this.quantity && this.quantity.nativeElement.select();
            }, 10);
        }
    }

    processItems(temp, type) {
        this.setTaxSegment(temp.tax);

        let pid = '';
        if (this.rawPurchaseData[0] !== undefined) {
            pid = new NullToQuotePipe().transform(this.rawPurchaseData[0].id);
        }

        let old_val = 0;

        if (new NullToQuotePipe().transform(temp.id) !== '') {
            old_val = temp.qty;
        }

        // from product tbl
        this.listArr.push({
            purchase_id: pid,
            pur_det_id: new NullToQuotePipe().transform(temp.id),
            checkbox: false,
            product_id: temp.product_id,
            product_code: temp.product_code,
            product_desc: temp.description,
            qty: temp.qty,
            packet_size: temp.packet_size,
            unit_price: temp.purchase_price,
            purchase_price: temp.purchase_price,
            mrp: temp.mrp,
            mrp_change_flag: temp.mrp_change_flag,
            tax: temp.tax,

            tax_value: (
                temp.purchase_price *
                temp.qty *
                (temp.tax / 100)
            ).toFixed(2),

            after_tax_value: temp.purchase_price * temp.qty,
            total_value: (
                temp.purchase_price * temp.qty +
                (temp.purchase_price * temp.qty * temp.tax) / 100
            ).toFixed(2),

            igs_t: this.igs_t,
            cgs_t: this.cgs_t,
            sgs_t: this.sgs_t,
            old_val,
            stock_id: temp.stock_id,
            quantity_error: '',
            pp_error: '',
            hsn_code: temp.hsn_code,
        });

        const tempArr = this.listArr.map((arrItem) =>
            parseFloat(arrItem.total_value)
        );

        const tempArrCostPrice = this.listArr.map((arr) =>
            parseFloat(arr.purchase_price)
        );

        this.total = tempArr
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
            )
            .toFixed(2);

        this.after_tax_value = tempArrCostPrice
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
            )
            .toFixed(2);

        this.submitForm.patchValue({
            after_tax_value: this.after_tax_value,
        });

        this.sumTotalTax();

        if (type === 'loading_now') {
            const v1 = 240 + this.listArr.length * 70 + 70;

            this.ScrollToPoint(0, v1);
        } else {
            this.ScrollToTop();
        }

        this.listArr = [...this.listArr];
        this._cdr.detectChanges();
    }

    displayFn(obj: any): string | undefined {
        return obj && obj.name ? obj.name : undefined;
    }

    displayProdFn(obj: any): string | undefined {
        return obj && obj.product_code ? obj.product_code : undefined;
    }

    clearProdInput() {
        this.submitForm.patchValue({
            product_ctrl: null,
            temp_mrp: 0,
            temp_desc: null,
            temp_qty: 1,
        });
        this.product_lis = null;
        this.selected_description = '';
        this.selected_mrp = '';
        this._cdr.markForCheck();
    }

    setVendorInfo(event, from) {
        if (from === 'click' && event.option.value === 'new') {
            this.addVendor();
        }
        if (event !== undefined) {
            this.vendor_selected = true;
            if (from === 'tab') {
                this.vendor_data = event;
                this.vendor_state_code = this.vendor_data.code;
                this.setTaxLabel();

                this._cdr.detectChanges();
                this._cdr.markForCheck();
            } else {
                this.vendor_data = event.option.value;
                this.vendor_state_code = this.vendor_data.code;
                this.setTaxLabel();

                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                this.plist && this.plist.nativeElement.focus();
                this._cdr.detectChanges();
                this._cdr.markForCheck();
            }
        }
    }

    sumTotalTax() {
        if (this.i_gst) {
            this.igs_t_Total = this.listArr
                .map(
                    (item) =>
                        (item.purchase_price *
                            item.qty *
                            parseFloat(item.taxrate)) /
                        100
                )
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0
                )
                .toFixed(2);

            this.submitForm.patchValue({
                igs_t: this.igs_t_Total,
                cgs_t: 0,
                sgs_t: 0,
            });
        } else {
            this.cgs_t_Total = this.listArr
                .map(
                    (item) =>
                        item.purchase_price *
                        item.qty *
                        (parseFloat(this.cgs_t) / 100)
                )
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0
                )
                .toFixed(2);

            this.sgs_t_Total = this.listArr
                .map(
                    (item) =>
                        (item.purchase_price *
                            item.qty *
                            parseFloat(this.sgs_t)) /
                        100
                )
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0
                )
                .toFixed(2);

            this.submitForm.patchValue({
                cgs_t: this.cgs_t_Total,
                sgs_t: this.sgs_t_Total,
                igs_t: 0,
            });
        }
    }

    deleteProduct(idx) {
        const test = this.listArr[idx];

        if (this.listArr[idx].pur_det_id !== '') {
            this.deletedRowArr.push(this.listArr[idx]);
        }

        this.listArr.splice(idx, 1);
        this.removeRowArr = this.removeRowArr.filter((e) => e !== idx);

        this.delIconStatus();
        this.checkIsSingleRow();
        this.calc();

        this._cdr.markForCheck();
    }

    checkIsSingleRow() {
        if (this.removeRowArr.length === 1) {
            this.singleRowSelected = true;
        } else {
            this.singleRowSelected = false;
        }
    }

    setTaxSegment(taxrate: number) {
        if (this.vendor_state_code !== this.user_data.code) {
            this.i_gst = true;
            this.igs_t = taxrate;
            this.cgs_t = 0;
            this.sgs_t = 0;
        } else {
            this.i_gst = false;
            this.igs_t = 0;
            this.cgs_t = taxrate / 2;
            this.sgs_t = taxrate / 2;
        }
    }

    setTaxLabel() {
        if (this.vendor_state_code !== this.user_data.code) {
            this.i_gst = true;
        } else {
            this.i_gst = false;
        }
    }

    // draft - status
    onSave(action) {
        this.onSubmit(action);
    }

    // final c completed - status
    onSaveAndSubmit(action) {
        this.onSubmit(action);
    }

    validateForms() {
        if (this.submitForm.value.invoice_no === null) {
            this.inputEl.nativeElement.focus();
            this.presentAlert('Enter Invoice number!');
            return false;
        }

        if (this.submitForm.value.invoice_date === null) {
            this.presentAlert('Enter Invoice Date!');
            return false;
        }

        if (
            this.submitForm.value.received_date === '' ||
            this.submitForm.value.received_date === null
        ) {
            this.presentAlert('Enter Received Date!');
            return false;
        }

        if (
            this.submitForm.value.invoice_date !== null &&
            this.submitForm.value.order_date !== ''
        ) {
            if (this.submitForm.value.order_no === '') {
                this.order_noEl.nativeElement.focus();
                this.presentAlert('Order Date without Order # not allowed');
                return false;
            }

            if (
                this.submitForm.value.order_date >
                this.submitForm.value.invoice_date
            ) {
                this.presentAlert(
                    'Order date should be less than Invoice date'
                );
                return false;
            }
        }

        if (
            this.submitForm.value.invoice_date !== null &&
            this.submitForm.value.lr_date !== ''
        ) {
            if (this.submitForm.value.lr_no === '') {
                this.presentAlert('Lr Date without Lr # not allowed');
                return false;
            }
            if (
                this.submitForm.value.lr_date <
                this.submitForm.value.invoice_date
            ) {
                this.presentAlert('Lr date should be after Invoice date');
                return false;
            }
        }

        return true;
    }

    check_errors() {
        return this.listArr.some((e) => {
            if (e.quantity_error !== '') {
                return true;
            }
        });
    }

    check_pp_errors() {
        return this.listArr.some((e) => {
            if (e.pp_error !== '') {
                return true;
            }
        });
    }

    onSubmit(action) {
        if (this.listArr.length === 0) {
            return this.presentAlert('No products added to save!');
        }

        if (this.listArr.length > 0) {
            console.log('check ' + this.check_errors());

            if (this.check_errors()) {
                return this.presentAlert('Fix errors in products quantity !');
            }

            if (this.check_pp_errors()) {
                return this.presentAlert('Fix errors in purchase price !');
            }

            if (this.validateForms()) {
                if (action === 'add') {
                    this.presentAlertConfirm('add');
                } else {
                    this.presentAlertConfirm('draft');
                }

                this.submitForm.patchValue({
                    product_arr: this.listArr,
                });

                this.submitForm.patchValue({
                    no_of_items: this.listArr.length,
                });

                this.submitForm.patchValue({
                    vendor_ctrl: this.vendor_data,
                });

                const totQtyCheckArr = this.listArr.map((arrItem) =>
                    parseFloat(arrItem.qty)
                );

                const tmpTotQty = totQtyCheckArr
                    .reduce(
                        (accumulator, currentValue) =>
                            accumulator + currentValue,
                        0
                    )
                    .toFixed(2);

                this.submitForm.patchValue({
                    total_quantity: tmpTotQty,
                });

                this.submitForm.patchValue({
                    total_value: this.total,
                });

                // let tmpNetTot = parseFloat(this.total) + parseFloat(this.submitForm.value.transport_charges) +
                //   parseFloat(this.submitForm.value.unloading_charges) +
                //   parseFloat(this.submitForm.value.misc_charges);

                // this.submitForm.patchValue({
                //   net_total: tmpNetTot
                // })

                this.submitForm.patchValue({
                    net_total: this.getNetTotal('rounding'),
                    roundoff: (
                        this.getNetTotal('rounding') -
                        this.getNetTotal('withoutrounding')
                    ).toFixed(2),
                });
            }
        }
    }

    getNetTotal(param) {
        const tmp =
            parseFloat(this.total) +
            parseFloat(this.submitForm.value.transport_charges || 0) +
            parseFloat(this.submitForm.value.unloading_charges || 0) +
            parseFloat(this.submitForm.value.misc_charges || 0);
        if (param === 'rounding') {
            return Math.round(+tmp.toFixed(2));
        } else if (param === 'withoutrounding') {
            return +tmp.toFixed(2);
        }
    }

    async presentAlert(msg: string) {
        const alert = await this.alertController.create({
            header: 'Alert',

            message: msg,
            buttons: ['OK'],
        });

        await alert.present();
    }

    openCurrencyPad(idx) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '400px';

        const dialogRef = this.dialog.open(CurrencyPadComponent, dialogConfig);

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap((val) => {
                    this.listArr[idx].qty = val;
                    this.quantityChange(idx);
                })
            )
            .subscribe();
    }

    openNumberPad(field) {
        const dialogRef = this.dialog.open(CurrencyPadComponent, {
            width: '400px',
        });

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap((val) => {
                    this.submitForm.controls[field].setValue(val);
                    this._cdr.markForCheck();
                })
            )
            .subscribe();
    }

    quantityChange(idx) {
        this.listArr[idx].total_value = (
            this.listArr[idx].purchase_price * this.listArr[idx].qty +
            (this.listArr[idx].purchase_price *
                this.listArr[idx].qty *
                this.listArr[idx].taxrate) /
                100
        ).toFixed(2);
        this.listArr[idx].after_tax_value = (
            this.listArr[idx].qty * this.listArr[idx].purchase_price
        ).toFixed(2);
        this.listArr[idx].tax_value = (
            this.listArr[idx].after_tax_value *
            (this.listArr[idx].taxrate / 100)
        ).toFixed(2);

        this.calc();

        this._cdr.markForCheck();
    }

    calc() {
        const tempArr = this.listArr.map(
            (arrItem) =>
                parseFloat(arrItem.after_tax_value) +
                parseFloat(arrItem.tax_value)
        );

        const tempArrCostPrice = this.listArr.map(
            (arr) => parseFloat(arr.purchase_price) * parseFloat(arr.qty)
        );

        // this.total = "" + tempArr;

        // this.total = tempArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0).toFixed(2);
        this.total = tempArr
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
            )
            .toFixed(2);
        this.after_tax_value = tempArrCostPrice
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
            )
            .toFixed(2);

        this.submitForm.patchValue({
            after_tax_value: this.after_tax_value,
        });

        this.submitForm.patchValue({
            total_value: this.total,
        });

        this.sumTotalTax();
        this._cdr.markForCheck();
    }

    async presentAlertConfirm(action) {
        this.submitForm.patchValue({
            center_id: this.user_data.center_id,
        });

        const alert = await this.alertController.create({
            header: 'Confirm!',
            message: 'Are you sure to?',
            cssClass: 'buttonCss',
            buttons: this.draftConfirm,
        });

        await alert.present();
    }

    mainSubmit(action, navto) {
        this.executeDeletes();

        if (action === 'add') {
            this.submitForm.patchValue({
                status: 'C',
            });
        } else if (action === 'draft') {
            this.submitForm.patchValue({
                status: 'D',
            });
        }

        //main submit
        this.clicked = true; // disable all buttons after submission
        this._cdr.markForCheck();
        this.spinner.show();

        this._commonApiService
            .savePurchaseOrder(this.submitForm.value)
            .subscribe((data: any) => {
                this.spinner.hide();
                this.clicked = false;
                //	console.log('savePurchaseOrder ' + JSON.stringify(data));

                if (data.body.result === 'success') {
                    if (navto === 'back') {
                        this.submitForm.reset();
                        this.init();
                        this.vendor_data = null;
                        this.submitForm.patchValue({
                            product_arr: [],
                        });
                        this.vendor_name = '';
                        this.vendor_selected = false;

                        this.listArr = [];

                        this.total = '0.00';
                        this.igs_t_Total = '0.00';
                        this.cgs_t_Total = '0.00';
                        this.sgs_t_Total = '0.00';
                    }
                    this._cdr.markForCheck();
                    if (action === 'add') {
                        this.listArr = [];

                        // add to the submitForm purchase_id
                        // reset listArr,
                        // call raw_purchase_id
                        // set mode to edit
                        this.submitForm.patchValue({
                            purchase_id: data.body.id,
                        });
                        this._commonApiService
                            .purchaseMasterData(data.body.id)
                            .subscribe((data1) => {
                                this.rawPurchaseData = data1;
                                this._cdr.markForCheck();
                                this.buildRawPurchaseData();
                            });

                        this.openSnackBar('Items Added!', '');
                    } else {
                        this.openSnackBar('Saved to Draft!', '');
                    }

                    if (navto === 'back') {
                        this.purchaseDashboard();
                    }
                } else {
                    this.presentAlert(
                        'Error: Something went wrong Contact Admin!'
                    );
                }

                this._cdr.markForCheck();
            });
    }

    checkedRow(idx: number) {
        if (!this.listArr[idx].checkbox) {
            this.listArr[idx].checkbox = true;
            this.removeRowArr.push(idx);
        } else if (this.listArr[idx].checkbox) {
            this.listArr[idx].checkbox = false;
            this.removeRowArr = this.removeRowArr.filter((e) => e !== idx);
        }
        this.delIconStatus();
        this.checkIsSingleRow();
    }

    delIconStatus() {
        if (this.removeRowArr.length > 0) {
            this.showDelIcon = true;
        } else {
            this.showDelIcon = false;
        }
    }

    onRemoveRows() {
        this.removeRowArr.sort(this.compare).reverse();

        this.removeRowArr.forEach((e) => {
            this.deleteProduct(e);
        });
    }

    compare(a: number, b: number) {
        return a - b;
    }

    executeDeletes() {
        this.deletedRowArr.sort().reverse();
        this.deletedRowArr.forEach((e) => {
            this.executeDeleteProduct(e);
        });
    }

    executeDeleteProduct(elem) {
        this._commonApiService
            .deletePurchaseDetails({
                center_id: this.user_data.center_id,
                id: elem.pur_det_id,
                purchaseid: elem.purchase_id,
                qty: elem.qty,
                product_id: elem.product_id,
                stock_id: elem.stock_id,
                mrp: elem.mrp,
                autidneeded: true,
            })
            .subscribe((data: any) => {
                if (data.body.result === 'success') {
                    console.log('object >>> execute delete product ...');
                } else {
                    this.presentAlert(
                        'Error: Something went wrong Contact Admin!'
                    );
                }

                this._cdr.markForCheck();
            });

        this._cdr.markForCheck();
    }

    async editTax() {
        // this.presentTaxValueChangeConfirm();

        const modalTax = await this._modalController.create({
            component: ChangeTaxComponent,
            componentProps: { pArry: this.listArr, rArray: this.removeRowArr },
            cssClass: 'tax-edit-modal',
        });

        modalTax.onDidDismiss().then((result) => {
            console.log('The result:', result);

            if (result.data !== undefined) {
                const myCheckboxes = this.myCheckboxes.toArray();

                this.removeRowArr.forEach((idx) => {
                    this.listArr[idx].taxrate = result.data;
                    this.listArr[idx].checkbox = false;
                    myCheckboxes[idx].checked = false;

                    this.quantityChange(idx);
                    this._cdr.markForCheck();
                });

                this.removeRowArr = [];

                this.delIconStatus();
                this.checkIsSingleRow();

                this._cdr.markForCheck();
            }
        });
        await modalTax.present();
    }

    async editMrp() {
        const modalTax = await this._modalController.create({
            component: ChangeMrpComponent,
            componentProps: { pArry: this.listArr, rArray: this.removeRowArr },
            cssClass: 'tax-edit-modal',
        });

        // when pop up close with new mrp value, set those value to the line item.
        // will always be single row mrp edit
        modalTax.onDidDismiss().then((result) => {
            console.log('The result:', result);

            if (result.data !== undefined) {
                const myCheckboxes = this.myCheckboxes.toArray();

                this.removeRowArr.forEach((idx) => {
                    this.listArr[idx].mrp = result.data;
                    this.listArr[idx].checkbox = false;
                    myCheckboxes[idx].checked = false;
                    this.listArr[idx].mrp_change_flag = 'Y';

                    this.quantityChange(idx);

                    this.delIconStatus();
                    this.checkIsSingleRow();

                    this._cdr.markForCheck();
                });

                this.removeRowArr = [];
                this.delIconStatus();
                this.checkIsSingleRow();

                this._cdr.markForCheck();
            }
        });
        await modalTax.present();
    }

    async presentDeleteConfirm() {
        const alert = await this.alertController.create({
            header: 'Confirm!',
            message: 'Are You sure to delete!!!',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                        console.log('Confirm Cancel: blah');
                    },
                },
                {
                    text: 'Okay',
                    handler: () => {
                        console.log('Confirm Okay');
                        this.onRemoveRows();
                    },
                },
            ],
        });

        await alert.present();
    }

    invoiceDateSelected($event) {
        this.max_order_date = $event.target.value;
    }

    logScrolling(event) {
        if (this.autoTrigger1 && this.autoTrigger1.panelOpen) {
            this.autoTrigger1.closePanel();
        }

        if (this.autoTrigger && this.autoTrigger.panelOpen) {
            this.autoTrigger.closePanel();
        }
    }

    purchaseDashboard() {
        this._router.navigateByUrl('/home/search-purchase-order');
    }

    // ScrollToBottom() {
    //   this.content.scrollToBottom(1500);
    // }

    ScrollToTop() {
        this.content.scrollToTop(1500);
    }

    ScrollToPoint(X, Y) {
        this.content.scrollToPoint(X, Y, 300);
    }

    openDialog(event): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '400px';
        dialogConfig.height = '100%';
        dialogConfig.data = this.vendor_data;
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            VendorViewDialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed');
        });
    }

    addVendor() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '80%';
        dialogConfig.height = '80%';

        const dialogRef = this._dialog.open(
            VendorAddDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    // do nothing check
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data !== 'close') {
                    this._commonApiService
                        .getVendorDetails(data.body.id)
                        .subscribe((vendData: any) => {
                            this.vendor_data = vendData[0];

                            this.vendor_name = vendData[0].name;
                            this.vendor_selected = true;

                            this.setVendorInfo(vendData[0], 'tab');

                            this.submitForm.patchValue({
                                vendor_ctrl: vendData[0],
                            });

                            this.isVLoading = false;
                            this.autoTrigger1.closePanel();

                            this._cdr.markForCheck();
                        });
                } else {
                    this.vendor_selected = false;
                    this.autoTrigger1.closePanel();

                    this._cdr.markForCheck();
                }

                this._cdr.markForCheck();
            });
    }

    async add() {
        let invDt = '';
        if (this.submitForm.value.invoice_date === null) {
            invDt = moment().format('DD-MM-YYYY');
        } else {
            invDt = moment(this.submitForm.value.invoice_date).format(
                'DD-MM-YYYY'
            );
        }

        if (
            this.submitForm.value.temp_desc === '' ||
            this.submitForm.value.temp_desc === null
        ) {
            this.submitForm.controls.temp_desc.setErrors({ required: true });
            this.submitForm.controls.temp_desc.markAsTouched();

            return false;
        }

        if (
            this.submitForm.value.temp_purchase_price === '' ||
            this.submitForm.value.temp_purchase_price === '0' ||
            this.submitForm.value.temp_purchase_price === null
        ) {
            this.submitForm.controls.temp_purchase_price.setErrors({
                required: true,
            });
            this.submitForm.controls.temp_purchase_price.markAsTouched();

            return false;
        }

        if (
            this.submitForm.value.temp_qty === '' ||
            this.submitForm.value.temp_qty === null
        ) {
            this.submitForm.controls.temp_qty.setErrors({ required: true });
            this.submitForm.controls.temp_qty.markAsTouched();

            return false;
        }

        if (
            this.submitForm.value.temp_mrp === '' ||
            this.submitForm.value.temp_mrp === null ||
            this.submitForm.value.temp_mrp === 0
        ) {
            this.submitForm.controls.temp_mrp.setErrors({ required: true });
            this.submitForm.controls.temp_mrp.markAsTouched();

            return false;
        }

        if (
            this.submitForm.value.customer_ctrl === '' ||
            this.submitForm.value.vendor_ctrl === null
        ) {
            this.submitForm.controls.vendor_ctrl.setErrors({ required: true });
            this.submitForm.controls.vendor_ctrl.markAsTouched();

            return false;
        }

        // this line over writes default qty vs entered qty
        this.lineItemData.qty = this.submitForm.value.temp_qty;
        this.lineItemData.purchase_price =
            this.submitForm.value.temp_purchase_price;
        this.lineItemData.mrp = this.submitForm.value.temp_mrp;

        if (this.orig_mrp !== this.submitForm.value.temp_mrp) {
            this.lineItemData.mrp_change_flag = 'Y';
        } else {
            this.lineItemData.mrp_change_flag = 'N';
        }

        this.itemAdd(this.lineItemData);
    }

    itemAdd(lineItemData) {
        this.processItems(this.lineItemData, 'loading_now');

        this.submitForm.patchValue({
            product_ctrl: '',
            temp_desc: '',
            temp_mrp: 0,
            temp_purchase_price: '',
            temp_qty: 1,
        });

        this.submitForm.controls.temp_desc.setErrors(null);
        this.submitForm.controls.temp_qty.setErrors(null);
        this.submitForm.controls.temp_mrp.setErrors(null);
        this.submitForm.controls.temp_purchase_price.setErrors(null);
        this.submitForm.controls.product_ctrl.setErrors(null);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.plist && this.plist.nativeElement.focus();

        this.selected_description = '';
        this.selected_mrp = '';

        this._cdr.markForCheck();
    }

    async presentCancelConfirm() {
        const alert = await this.alertController.create({
            header: 'Confirm!',
            message: 'Are you sure to leave the page?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                        console.log('Confirm Cancel: blah');
                    },
                },
                {
                    text: 'Okay',
                    handler: () => {
                        console.log('Confirm Okay');
                        // this.cancel();
                        //main submit
                        this.clicked = true; // disable all buttons after submission
                        this._cdr.markForCheck();
                        this._router.navigateByUrl('/home/search-purchase');
                    },
                },
            ],
        });

        await alert.present();
    }

    roundingFn(value, param) {
        if (param === 'rounding') {
            return Math.round(+value.toFixed(2));
        } else if (param === 'without-rounding') {
            return +value.toFixed(2);
        }
    }

    handleQtyChange($event, idx) {
        const qty_val = $event.target.value;

        if (qty_val > 0) {
            this.listArr[idx].qty = $event.target.value;
            this.quantityChange(idx);
            this.listArr[idx].quantity_error = '';
            this._cdr.detectChanges();
        } else {
            this.listArr[idx].quantity_error = 'error';
            this._cdr.detectChanges();
        }
    }

    handlePPChange($event, idx) {
        const val = $event.target.value;

        if (val > 0) {
            this.listArr[idx].purchase_price = $event.target.value;
            this.quantityChange(idx);
            this.listArr[idx].pp_error = '';
            this._cdr.detectChanges();
        } else {
            this.listArr[idx].pp_error = 'error';
            this._cdr.detectChanges();
        }
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 2000,
            panelClass: ['mat-toolbar', 'mat-primary'],
        });
    }
    identify(index, item) {
        return item.id;
    }

    async showInventoryReportsDialog(product_code, product_id) {
        const modal = await this._modalController.create({
            component: InventoryReportsDialogComponent,
            componentProps: {
                center_id: this.user_data.center_id,
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
}
