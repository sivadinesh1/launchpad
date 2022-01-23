import {
    Component,
    ChangeDetectorRef,
    ViewChild,
    ElementRef,
    ViewChildren,
    QueryList,
    ChangeDetectionStrategy,
    HostListener,
    OnInit,
    AfterViewInit,
} from '@angular/core';
import {
    ModalController,
    PickerController,
    AlertController,
} from '@ionic/angular';

import { CommonApiService } from '../../services/common-api.service';
import {
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    FormArray,
    FormGroupDirective,
} from '@angular/forms';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { CurrencyPadComponent } from '../../components/currency-pad/currency-pad.component';

import { AuthenticationService } from '../../services/authentication.service';
import { ChangeTaxComponent } from '../../components/change-tax/change-tax.component';
import { ChangeMrpComponent } from '../../components/change-mrp/change-mrp.component';
import { Route, ActivatedRoute, Router } from '@angular/router';
import { NullToQuotePipe } from '../../util/pipes/null-quote.pipe';
import {
    filter,
    tap,
    debounceTime,
    switchMap,
    startWith,
    catchError,
} from 'rxjs/operators';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';

import { SaleApiService } from '../../services/sale-api.service';

import { InvoiceSuccessComponent } from '../../components/invoice-success/invoice-success.component';

import { Customer } from 'src/app/models/Customer';
import { IProduct } from '../../models/Product';
import { EMPTY, empty } from 'rxjs';
import { RequireMatch } from '../../util/directives/requireMatch';
import {
    MatAutocomplete,
    MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { IonContent } from '@ionic/angular';
import { CustomerViewDialogComponent } from '../../components/customers/customer-view-dialog/customer-view-dialog.component';
import { CustomerAddDialogComponent } from '../../components/customers/customer-add-dialog/customer-add-dialog.component';
import { ConvertToSaleDialogComponent } from '../../components/convert-to-sale-dialog/convert-to-sale-dialog.component';
import { Observable } from 'rxjs';
import { User } from '../../models/User';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductAddDialogComponent } from '../../components/products/product-add-dialog/product-add-dialog.component';
import { SuccessMessageDialogComponent } from '../../components/success-message-dialog/success-message-dialog.component';

import { InventoryReportsDialogComponent } from '../../components/reports/inventory-reports-dialog/inventory-reports-dialog.component';
import { ManualInvoiceNumberDialogComponent } from '../../components/sales/manual-invoice-number-dialog/manual-invoice-number-dialog.component';
import { formatDate } from '@angular/common';
import { ComponentCanDeactivate } from 'src/app/services/dirty-check.guard';
import { IProductSearchDto } from 'src/app/dto/product-search.dto';
import { plainToClass } from 'class-transformer';
import { Sale } from 'src/app/models/Sale';
import { SaleDetail } from 'src/app/models/SaleDetail';
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
    selector: 'app-sale-order',
    templateUrl: './sale-order.page.html',
    styleUrls: ['./sale-order.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleOrderPage implements ComponentCanDeactivate, AfterViewInit {
    @ViewChild('orderNo', { static: false }) orderNoEl: ElementRef;
    @ViewChild('selItemCode', { static: false }) selItemCode: ElementRef;

    @ViewChild('newRow', { static: true }) newRow: any;
    @ViewChildren('myCheckbox') myCheckboxes: QueryList<any>;

    // TAB navigation for customer list
    @ViewChild('typeHead1', { read: MatAutocompleteTrigger })
    autoTrigger1: MatAutocompleteTrigger;

    @ViewChild(FormGroupDirective) formRef: FormGroupDirective;

    @ViewChild('typehead2', { read: MatAutocompleteTrigger })
    prodCtrlTrigger: MatAutocompleteTrigger;

    @ViewChild('p_list', { static: true }) p_list: any;
    @ViewChild('c_list', { static: true }) c_list: any;

    @ViewChild('qty', { static: true }) qty: any;
    @ViewChildren('para') paras: any;
    @ViewChild(IonContent, { static: false }) content: IonContent;

    breadMenu = 'New Sale';

    listArr = [];

    total = '0.00';

    customer_state_code: any;
    center_state_code: any;
    i_gst: any;
    customer_data: any;

    submitForm: FormGroup;

    customer_name = '';
    customer_name_print = '';

    no_of_boxes: any;

    selNoOfBoxes: any;
    igs_t: any;
    cgs_t: any;
    sgs_t: any;

    igs_t_Total = '0.00';
    cgs_t_Total = '0.00';
    sgs_t_Total = '0.00';

    tax_percentage: any;
    after_tax_value: any;

    removeRowArr = [];

    deletedRowArr = [];

    showDelIcon = false;
    singleRowSelected = false;
    // sale_id: any;
    rawSalesData: any;

    maxDate = new Date();
    maxOrderDate = new Date();

    editCompletedSales: any;

    customer_discount_percent: any;
    customer_discount_type: any;
    mode: string;
    id: string;
    sale_type: string;

    testTotal: any;
    invoice_id: any;
    final_invoice_no: any;
    invoice_date = new Date();

    isLoading = false;
    isCLoading = false;

    is_customer_selected = true;

    lineItemData: any;
    selInvType: any;

    orig_selInvType: any;

    stock_issue_date_ref: any;
    stock_issue_ref: any;
    clicked = false;

    selected_description = '';
    selected_mrp = '';

    isRetailCustomer = 'N';

    paraElements: any;

    customer_lis: Customer[];
    product_lis: IProductSearchDto[];

    user_data$: Observable<User>;
    user_data: any;

    question = '+ Add Customer"';
    //ready = 0; // flag check - center_id (local_storage) & customer_id (param)

    // 3 Entry Ways. Via (i)Enquiry to Sale (ii) draft/completed Sale (iii) New Sale
    // (i && iii) - ignore customer_change flag, if (ii) process customer change flag
    // onload store customer id & check during submit. Handling Customer change for draft/completed sale
    original_customer_id: string;
    isFreshSale = false;
    fromEnquiry: any;

    cart_product_meta: IProduct[];

    constructor(
        private _modalController: ModalController,
        public dialog: MatDialog,
        public alertController: AlertController,
        private _router: Router,
        private _route: ActivatedRoute,
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private _authService: AuthenticationService,
        private _saleApiService: SaleApiService,
        private _commonApiService: CommonApiService,
        private _fb: FormBuilder,
        private spinner: NgxSpinnerService,
        private _cdr: ChangeDetectorRef
    ) {
        // this.basicInit();
        this.user_data$ = this._authService.currentUser;
        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.user_data = data;

                // data change
                this._route.data.subscribe((data1) => {
                    this.selInvType = 'gstInvoice';
                    this.listArr = [];
                    this.cancel();

                    this.rawSalesData = data1.rawSalesData;
                });
                // param change
                this._route.params.subscribe((params) => {
                    this.basicInit();
                    this.submitForm.patchValue({
                        center_id: this.user_data.center_id,
                    });

                    this.clicked = false;

                    this.id = params.id;
                    this.mode = params.mode;
                    this.sale_type = params.saleType;

                    if (this.sale_type === 'SI') {
                        this.selInvType = 'stockIssue';
                        this._authService.setCurrentMenu('Stock Issue');
                    } else if (this.sale_type === 'TI') {
                        this.selInvType = 'gstInvoice';
                        this._authService.setCurrentMenu('Sale Orders');
                    }

                    if (this.user_data !== undefined) {
                        this.initialize();
                        this.submitForm.patchValue({
                            center_id: this.user_data.center_id,
                        });

                        if (this.sale_type === 'SI') {
                            this.submitForm.patchValue({
                                invoice_type: 'stockIssue',
                            });
                        } else {
                            this.submitForm.patchValue({
                                invoice_type: 'gstInvoice',
                            });
                        }
                    }
                });

                this._cdr.markForCheck();
            });
    }

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (this.submitForm.pristine) {
            return true;
        } else {
            return false;
        }
    }

    basicInit() {
        this.submitForm = this._fb.group({
            center_id: [null],
            id: new FormControl(),

            invoice_no: [null],
            invoice_date: new FormControl(
                this.invoice_date,
                Validators.required
            ),
            order_no: new FormControl(''),
            order_date: new FormControl(),
            lr_no: new FormControl(''),
            lr_date: new FormControl(null),
            no_of_boxes: new FormControl(0),

            no_of_items: [0],
            total_quantity: [0],
            value: new FormControl(0),
            total_value: new FormControl(0),
            igs_t: new FormControl(0),
            cgs_t: [0],
            sgs_t: new FormControl(0),
            transport_charges: [0],
            unloading_charges: [0],
            misc_charges: [0],
            net_total: new FormControl(0),
            after_tax_value: new FormControl(0),
            status: new FormControl(''),
            enquiry_ref: [0],
            revision: [0],
            invoice_type: ['gstInvoice', [Validators.required]],

            customer_ctrl: [null, [Validators.required, RequireMatch]],
            product_ctrl: [null, [RequireMatch]],
            temp_desc: [''],
            temp_mrp: [0],
            temp_qty: [
                '1',
                [
                    Validators.required,
                    Validators.max(1000),
                    Validators.min(1),
                    Validators.pattern(/\-?\d*\.?\d{1,2}/),
                ],
            ],

            product_arr: new FormControl(null),
            round_off: [0],
            retail_customer_name: ['Cash Sale'],
            retail_customer_address: [''],
            retail_customer_phone: [''],
            hasCustomerChange: [''],
            old_customer_id: [''],
            inv_gen_mode: ['A'],
        });
    }

    initialize() {
        this.init();

        if (this.id === '0') {
            // id ===0 means fresh sale
            this.isFreshSale = true;
            this.getInvoiceSequence('gstInvoice');
        }

        // comes from MOVE TO SALE: Enquiry -> sale process
        if (this.mode === 'enquiry') {
            this.getInvoiceSequence('gstInvoice');
            // id refers to enquiry id, also recorded as orderNo in sales table
            this.submitForm.patchValue({
                enq_ref: this.id,
                order_no: this.id,
            });

            this.fromEnquiry = true;

            this.spinner.show();
            this._commonApiService
                .getCustomerData(this.id)
                .subscribe((customer_data: any) => {
                    this.customer_data = customer_data[0];

                    this.submitForm.patchValue({
                        customer_ctrl: customer_data[0],
                    });

                    this.customer_name = customer_data[0].name;
                    this.customer_name_print = customer_data[0].name;
                    // record original customer id from enquiry, can ignore while submitting
                    // as there will be no reference in ledger/payment tables
                    this.original_customer_id = customer_data[0].id;
                    this.is_customer_selected = true;

                    this.setTaxLabel(customer_data[0].code);

                    const inv_dt = moment(
                        this.submitForm.value.invoice_date
                    ).format('DD-MM-YYYY');

                    // prod details
                    this._commonApiService
                        .getEnquiredProductData(
                            this.customer_data.id,
                            this.id,
                            inv_dt
                        )
                        .subscribe((prodData: any) => {
                            this.spinner.hide();
                            const prod_data = prodData;

                            this.submitForm.patchValue({
                                order_date:
                                    prod_data[0].enquiry_date === ''
                                        ? ''
                                        : new Date(
                                              new NullToQuotePipe()
                                                  .transform(
                                                      prodData[0].enquiry_date
                                                  )
                                                  .replace(
                                                      /(\d{2})-(\d{2})-(\d{4})/,
                                                      '$2/$1/$3'
                                                  )
                                          ),
                            });

                            prod_data.forEach((element) => {
                                this.processItems(element, 'preload');
                            });

                            this._cdr.markForCheck();
                        });

                    this._cdr.markForCheck();
                });
        }

        // raw sales data : which comes from regular sale screen and not from enquiry screen
        this.buildRawSaleData();
    }

    buildRawSaleData() {
        if (this.rawSalesData !== null && this.rawSalesData !== undefined) {
            if (this.rawSalesData[0] !== undefined) {
                if (this.rawSalesData[0].id !== 0) {
                    if (this.rawSalesData[0].invoice_type === 'gstInvoice') {
                        this.breadMenu = 'Modify Sale #';
                    } else {
                        this.breadMenu = 'Modify Stock Issue #';
                    }

                    this.selInvType = this.rawSalesData[0].invoice_type;
                    this.orig_selInvType = this.rawSalesData[0].invoice_type;
                    this.stock_issue_ref = this.rawSalesData[0].stock_issue_ref;
                    this.stock_issue_date_ref =
                        this.rawSalesData[0].stock_issue_date_ref;
                    this.original_customer_id =
                        this.rawSalesData[0].customer_id; //capture customer id while loading

                    this.submitForm.patchValue({
                        id: this.rawSalesData[0].id,
                        invoice_no: this.rawSalesData[0].invoice_no,
                        invoice_type: this.rawSalesData[0].invoice_type,
                        invoice_date: new Date(
                            new NullToQuotePipe()
                                .transform(this.rawSalesData[0].invoice_date)
                                .replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')
                        ),

                        order_date:
                            this.rawSalesData[0].order_date === '' &&
                            this.rawSalesData[0].invoice_type === null
                                ? ''
                                : new Date(
                                      new NullToQuotePipe()
                                          .transform(
                                              this.rawSalesData[0].order_date
                                          )
                                          .replace(
                                              /(\d{2})-(\d{2})-(\d{4})/,
                                              '$2/$1/$3'
                                          )
                                  ),

                        lr_no: this.rawSalesData[0].lr_no,

                        lr_date:
                            this.rawSalesData[0].lr_date === '' ||
                            this.rawSalesData[0].lr_date === null
                                ? null
                                : new Date(
                                      new NullToQuotePipe()
                                          .transform(
                                              this.rawSalesData[0].lr_date
                                          )
                                          .replace(
                                              /(\d{2})-(\d{2})-(\d{4})/,
                                              '$2/$1/$3'
                                          )
                                  ),
                        order_no: this.rawSalesData[0].order_no,
                        no_of_boxes: this.rawSalesData[0].no_of_boxes,

                        no_of_items: this.rawSalesData[0].no_of_items,
                        total_quantity: this.rawSalesData[0].total_quantity,
                        value: this.rawSalesData[0].total_value,
                        total_value: this.rawSalesData[0].total_value,
                        igs_t: this.rawSalesData[0].igs_t,
                        cgs_t: this.rawSalesData[0].cgs_t,
                        sgs_t: this.rawSalesData[0].sgs_t,
                        transport_charges:
                            this.rawSalesData[0].transport_charges,
                        unloading_charges:
                            this.rawSalesData[0].unloading_charges,
                        misc_charges: this.rawSalesData[0].misc_charges,
                        net_total: this.rawSalesData[0].net_total,
                        after_tax_value: this.rawSalesData[0].after_tax_value,
                        status: this.rawSalesData[0].status,
                        revision: this.rawSalesData[0].revision,
                        retail_customer_name:
                            this.rawSalesData[0].retail_customer_name,
                        retail_customer_address:
                            this.rawSalesData[0].retail_customer_address,
                        retail_customer_phone:
                            this.rawSalesData[0].retail_customer_phone,
                        inv_gen_mode: this.rawSalesData[0].inv_gen_mode,
                    });

                    if (
                        this.rawSalesData[0].status === 'C' ||
                        this.rawSalesData[0].status === 'D'
                    ) {
                        this.editCompletedSales = true;
                    }

                    this._cdr.markForCheck();

                    this._commonApiService
                        .getCustomerDetails(this.rawSalesData[0].customer_id)
                        .subscribe((customer_data: any) => {
                            this.customer_data = customer_data[0];

                            this.submitForm.patchValue({
                                customer_ctrl: customer_data[0],
                            });

                            this.customer_name = customer_data[0].name;
                            this.customer_name_print = customer_data[0].name;
                            this.is_customer_selected = true;

                            this.setTaxLabel(customer_data[0].code);

                            if (this.customer_name === 'Walk In') {
                                this.isRetailCustomer = 'Y';
                            } else {
                                this.isRetailCustomer = 'N';
                            }

                            this._cdr.markForCheck();
                        });

                    this._commonApiService
                        .saleDetails(this.rawSalesData[0].id)
                        .subscribe((saleData: any) => {
                            const sData = saleData;

                            sData.forEach((element) => {
                                this.processItems(element, 'preload');
                            });
                        });

                    this._cdr.markForCheck();
                }
            }
        }
    }

    init() {
        this.clearInput();
        this.clearProdInput();
        this.searchCustomers();
        this.searchProducts();

        this._cdr.markForCheck();
    }

    searchCustomers() {
        this.submitForm.controls.customer_ctrl.valueChanges
            .pipe(
                debounceTime(300),
                tap(() => (this.isCLoading = true)),
                switchMap((id: any) => {
                    if (
                        id != null &&
                        id.length !== undefined &&
                        id.length >= 2
                    ) {
                        return this._commonApiService.getCustomerInfo({
                            center_id: this.user_data.center_id,
                            search_text: id,
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

    processItems(temp, type) {
        this.setTaxSegment(temp.tax);
        let subtotal = 0;
        let taxable_val = 0;
        let total_val = 0;
        let disc_val = 0;

        let sid = '';
        if (this.rawSalesData !== null && this.rawSalesData !== undefined) {
            if (this.rawSalesData[0] !== undefined) {
                sid = new NullToQuotePipe().transform(this.rawSalesData[0].id);
            }
        }

        let old_val = 0;

        if (new NullToQuotePipe().transform(temp.id) !== '') {
            old_val = temp.quantity;
        }

        // else part is when navigating via edit sale,
        // when disc_info present its fresh adding products, if not, take it from sale_detail tbl
        if (temp.disc_info !== undefined && temp.disc_info !== null) {
            const disc_info = temp.disc_info;
            this.customer_discount_type = disc_info.substring(
                disc_info.indexOf('~') + 1
            );
            this.customer_discount_percent = disc_info.substring(
                0,
                disc_info.indexOf('~')
            );
        } else {
            this.customer_discount_percent = temp.disc_percent;
        }

        // Discount Calculation
        subtotal = temp.quantity * temp.mrp;
        taxable_val =
            (temp.quantity *
                temp.mrp *
                (100 - this.customer_discount_percent)) /
            (100 + temp.tax);
        disc_val =
            temp.quantity * temp.mrp * (this.customer_discount_percent / 100);

        total_val =
            (temp.quantity *
                temp.mrp *
                (100 - this.customer_discount_percent)) /
            100;

        // from product tbl
        this.listArr.push({
            center_id: this.user_data.center_id,
            sale_id: sid,
            id: new NullToQuotePipe().transform(temp.id),
            checkbox: false,
            product_id:
                temp.product !== undefined ? temp.product.id : temp.product_id,
            hsn_code:
                temp.product !== undefined
                    ? temp.product.hsn_code
                    : temp.hsn_code,
            product_code:
                temp.product !== undefined
                    ? temp.product.product_code
                    : temp.product_code,
            product_description:
                temp.product !== undefined
                    ? temp.product.product_description
                    : temp.product_description,
            packet_size:
                temp.product !== undefined
                    ? temp.product.packet_size
                    : temp.packet_size,
            quantity: temp.quantity,
            unit_price: temp.unit_price,
            mrp: temp.mrp,
            mrp_change_flag: 'N',
            tax: temp.tax,

            sub_total: subtotal.toFixed(2),
            after_tax_value: taxable_val.toFixed(2),
            disc_value: disc_val.toFixed(2),
            disc_percent: this.customer_discount_percent,

            total_value: total_val.toFixed(2),
            tax_value: (total_val - taxable_val).toFixed(2),

            igs_t: this.igs_t,
            cgs_t: this.cgs_t,
            sgs_t: this.sgs_t,
            old_val,
            stock_id: temp.stock !== undefined ? temp.stock.id : temp.stock_id,
            del_flag: 'N',
            margin:
                total_val / temp.quantity - temp.unit_price < 0
                    ? 'marginNeg'
                    : '',
            qty_error: '',
            disc_error: '',
        });

        const tempArr = this.listArr.map((arrItem) =>
            parseFloat(arrItem.total_value)
        );

        const tempArrCostPrice = this.listArr.map((arr) =>
            parseFloat(arr.unit_price)
        );

        this.total = tempArr
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
            )
            .toFixed(2);
        console.log(
            'TCL: PurchasePage -> showAddProductComp -> this.total',
            this.total
        );

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

        this._cdr.markForCheck();
    }

    ScrollToPoint(X, Y) {
        this.content.scrollToPoint(X, Y, 300);
    }

    clearInput() {
        this.submitForm.patchValue({
            customer_ctrl: null,
        });

        this.is_customer_selected = false;

        this._cdr.markForCheck();
    }

    async handleCustomerChange() {
        if (this.c_list !== undefined) {
            this.c_list.nativeElement.focus();
        }

        const alert = await this.alertController.create({
            header: 'Confirm!',
            message:
                'Customer change. Do you want to proceed? Revisit customer discount for accuracy',
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

                        this.clearInput();
                    },
                },
            ],
        });

        await alert.present();
    }

    sumTotalTax() {
        if (this.i_gst) {
            this.igs_t_Total = this.listArr
                .map((item) => +item.tax_value) // convert to number using +
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0
                )
                .toFixed(2);

            console.log('dines' + this.igs_t_Total);
            this.submitForm.patchValue({
                igs_t: this.igs_t_Total,
                cgs_t: 0,
                sgs_t: 0,
            });
        } else {
            this.cgs_t_Total = this.listArr
                .map((item) => item.tax_value / 2)
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0
                )
                .toFixed(2);

            this.sgs_t_Total = this.listArr
                .map((item) => item.tax_value / 2)
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
        this._cdr.markForCheck();
    }

    ngAfterViewInit() {
        this.spinner.hide();
        setTimeout(() => {
            if (this.c_list !== undefined) {
                this.c_list.nativeElement.focus();
            }

            if (this.mode === 'edit' && this.id !== '0') {
                if (this.p_list !== undefined) {
                    this.p_list.nativeElement.focus();
                }

                this.openSnackBar(
                    'WARNING: Editing completed sales!',
                    '',
                    'mat-warn'
                );
            }

            this._cdr.detectChanges();
        }, 100);

        if (this.autoTrigger1 !== undefined) {
            this.autoTrigger1.panelClosingActions.subscribe((x) => {
                if (
                    this.autoTrigger1.activeOption &&
                    this.autoTrigger1.activeOption.value !== undefined
                ) {
                    this.submitForm.patchValue({
                        customer_ctrl: this.autoTrigger1.activeOption.value,
                    });
                    this.setCustomerInfo(
                        this.autoTrigger1.activeOption.value,
                        'tab'
                    );
                }
            });
        }

        if (this.prodCtrlTrigger !== undefined) {
            this.prodCtrlTrigger.panelClosingActions.subscribe((x) => {
                if (
                    this.prodCtrlTrigger.activeOption &&
                    this.prodCtrlTrigger.activeOption.value !== undefined
                ) {
                    this.submitForm.patchValue({
                        product_ctrl: this.prodCtrlTrigger.activeOption.value,
                    });

                    this.setItemDesc(
                        this.prodCtrlTrigger.activeOption.value,
                        'tab'
                    );
                }
            });
        }
        setTimeout(() => {
            console.log('inside set time para');
            this.paraElements = this.paras.map((para) => {
                console.log('Paras: ', para.nativeElement);
                return para.nativeElement;
            });
        }, 100);
    }

    deleteProduct(idx) {
        if (this.listArr[idx].id !== '' && this.listArr[idx].id !== undefined) {
            this.listArr[idx].del_flag = 'Y';
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

    setTaxSegment(tax: number) {
        if (this.i_gst) {
            this.i_gst = true;
            this.igs_t = tax;
            this.cgs_t = 0;
            this.sgs_t = 0;
        } else {
            this.i_gst = false;
            this.igs_t = 0;
            this.cgs_t = tax / 2;
            this.sgs_t = tax / 2;
        }
    }

    setTaxLabel(customer_state_code) {
        if (customer_state_code !== this.user_data.code) {
            this.i_gst = true;
        } else {
            this.i_gst = false;
        }
    }

    validateForms() {
        if (this.submitForm.value.invoice_date == null) {
            this.presentAlert('Enter Invoice Date!');
            return false;
        }

        if (this.mode === 'enquiry') {
            if (
                this.submitForm.value.invoice_date !== null &&
                this.submitForm.value.order_date !== '' &&
                this.submitForm.value.order_date != null
            ) {
                if (
                    this.submitForm.value.order_no === '' &&
                    this.submitForm.value.order_date != null
                ) {
                    if (this.orderNoEl !== undefined) {
                        this.orderNoEl.nativeElement.focus();
                    }

                    this.presentAlert(
                        'Enquiry Date without Enquiry # not allowed'
                    );
                    return false;
                }

                if (
                    moment(this.submitForm.value.order_date).format(
                        'DD-MM-YYYY'
                    ) >
                    moment(this.submitForm.value.invoice_date).format(
                        'DD-MM-YYYY'
                    )
                ) {
                    this.presentAlert(
                        'Invoice date should be after Enquiry date'
                    );
                    return false;
                }
            }
        }

        if (
            this.submitForm.value.invoice_date !== null &&
            this.submitForm.value.lr_date !== '' &&
            this.submitForm.value.lr_date !== null
        ) {
            if (this.submitForm.value.lr_no === '') {
                this.presentAlert('Lr Date without Lr # not allowed');
                return false;
            }

            if (
                formatDate(
                    this.submitForm.value.lr_date,
                    'dd-MM-yyyy',
                    'en-US'
                ) <
                formatDate(
                    this.submitForm.value.invoice_date,
                    'dd-MM-yyyy',
                    'en-US'
                )
            ) {
                this.presentAlert('Lr date should be after Invoice date');
                return false;
            }
        }

        return true;
    }

    checkErrors() {
        return this.listArr.some((e) => {
            if (e.qty_error !== '') {
                return true;
            }
        });
    }

    checkDiscountErrors() {
        return this.listArr.some((e) => {
            if (e.disc_error !== '') {
                return true;
            }
        });
    }

    /** Gets invalid controls & prints in console */
    public findInvalidControls() {
        const invalid = [];
        const controls = this.submitForm.controls;
        for (const name in controls) {
            if (controls[name].invalid) {
                console.log(controls[name].errors);
                invalid.push(name);
            }
        }
        return invalid;
    }

    checkIsNumber(param: string) {
        if (
            this.submitForm.get(param).value === '' ||
            this.submitForm.get(param).value === null ||
            this.submitForm.get(param).value < 0
        ) {
            this.submitForm.controls[param].setValue(0);
        }
    }

    onSubmit(action, sub_action) {
        if (this.listArr.length === 0) {
            return this.presentAlert('No products added to save!');
        }

        if (!this.submitForm.valid) {
            // DnD this helps in finding invalid controls name, used for debugging
            console.log('invalid field ' + this.findInvalidControls());
            this.presentAlert('Validation Failure Error!');
            return false;
        }

        if (this.listArr.length > 0) {
            if (this.checkErrors()) {
                return this.presentAlert('Fix errors in products quantity !');
            }

            if (this.checkDiscountErrors()) {
                return this.presentAlert('Fix errors in products discount !');
            }

            if (this.validateForms()) {
                this.submitForm.patchValue({
                    product_arr: this.listArr,
                });

                this.submitForm.patchValue({
                    no_of_items: this.listArr.length,
                });

                this.submitForm.patchValue({
                    customer_ctrl: this.customer_data,
                });

                const totalQuantityCheckArr = this.listArr.map((arrItem) =>
                    parseFloat(arrItem.quantity)
                );

                const tmpTotQty = totalQuantityCheckArr
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

                this.submitForm.patchValue({
                    net_total: this.getNetTotal('rounding'),
                    round_off: Number(
                        this.getNetTotal('rounding') -
                            this.getNetTotal('without_rounding')
                    ).toFixed(2),
                });

                if (action === 'add') {
                    this.mainSubmit('add', 'back');
                } else if (action === 'draft') {
                    if (sub_action === 'continue') {
                        this.mainSubmit('draft', 'stay');
                    } else {
                        this.mainSubmit('draft', 'back');
                    }
                }
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
        } else if (param === 'without_rounding') {
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

    invoiceSuccess(invoice_id) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '600px';

        dialogConfig.data = {
            customer_name: this.customer_name_print,
            id: this.invoice_id,
            invoice_no: this.final_invoice_no,
        };

        const dialogRef = this.dialog.open(
            InvoiceSuccessComponent,
            dialogConfig
        );

        dialogRef.afterClosed();
    }

    convertToInvoiceSuccess(invoice_id, invoice_date) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '400px';

        dialogConfig.data = {
            invoice_id,
            invoice_date,
        };

        const dialogRef = this.dialog.open(
            ConvertToSaleDialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe((data) => {
            console.log('The dialog was closed');
            this._router.navigateByUrl('/home/search-sales');
        });
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

    handleDiscountChange($event, idx) {
        const discVal = $event.target.value;

        if (+discVal <= 100 && discVal !== '') {
            this.listArr[idx].disc_percent = $event.target.value;

            this.qtyChange(idx);
            this.listArr[idx].disc_error = '';
            this._cdr.detectChanges();
        } else {
            this.listArr[idx].disc_error = 'error';
            this._cdr.detectChanges();
        }
    }

    handleQtyChange($event, idx) {
        const qty_val = $event.target.value;

        if (qty_val > 0) {
            this.listArr[idx].quantity = $event.target.value;
            this.qtyChange(idx);
            this.listArr[idx].qty_error = '';
            this._cdr.detectChanges();
        } else {
            this.listArr[idx].qty_error = 'error';
            this._cdr.detectChanges();
        }
    }

    handleMrpChange($event, idx) {
        const newMrp = $event.target.value;
    }

    qtyChange(idx) {
        if (this.customer_discount_type === 'NET') {
            this.listArr[idx].sub_total = (
                this.listArr[idx].quantity * this.listArr[idx].mrp
            ).toFixed(2);

            this.listArr[idx].total_value = (
                (this.listArr[idx].quantity *
                    this.listArr[idx].mrp *
                    (100 - this.listArr[idx].disc_percent)) /
                100
            ).toFixed(2);

            this.listArr[idx].disc_value = (
                (this.listArr[idx].quantity *
                    this.listArr[idx].mrp *
                    this.listArr[idx].disc_percent) /
                100
            ).toFixed(2);

            this.listArr[idx].after_tax_value = (
                (this.listArr[idx].quantity *
                    this.listArr[idx].mrp *
                    (100 - this.listArr[idx].disc_percent)) /
                (100 + this.listArr[idx].tax)
            ).toFixed(2);
            this.listArr[idx].tax_value = (
                this.listArr[idx].total_value -
                this.listArr[idx].after_tax_value
            ).toFixed(2);
        } else {
            this.listArr[idx].sub_total = (
                this.listArr[idx].quantity * this.listArr[idx].mrp
            ).toFixed(2);
            this.listArr[idx].total_value = (
                ((this.listArr[idx].quantity *
                    this.listArr[idx].mrp *
                    (100 - this.listArr[idx].disc_percent)) /
                    100) *
                (1 + this.listArr[idx].tax / 100)
            ).toFixed(2);
            this.listArr[idx].disc_value = (
                ((this.listArr[idx].quantity *
                    this.listArr[idx].mrp *
                    this.listArr[idx].disc_percent) /
                    100) *
                (1 + this.listArr[idx].tax / 100)
            ).toFixed(2);
            this.listArr[idx].after_tax_value = (
                (this.listArr[idx].quantity *
                    this.listArr[idx].mrp *
                    (100 - this.listArr[idx].disc_percent)) /
                100
            ).toFixed(2);
            this.listArr[idx].tax_value = (
                this.listArr[idx].total_value -
                this.listArr[idx].after_tax_value
            ).toFixed(2);
        }

        this.listArr[idx].margin =
            this.listArr[idx].total_value / this.listArr[idx].quantity -
                this.listArr[idx].unit_price <
            0
                ? 'marginNeg'
                : '';

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
            (arr) => parseFloat(arr.unit_price) * parseFloat(arr.quantity)
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

        this.submitForm.patchValue({
            total_value: this.total,
        });

        this.sumTotalTax();
        this._cdr.markForCheck();
    }

    marginCheck(margin) {
        if (margin === 'marginNeg') {
            return 'marginNeg';
        }
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

        // Check if customer changed and set status
        // shouldn't be fresh sale or move_to_sale(enquiry-sale)

        if (!this.isFreshSale && !this.fromEnquiry) {
            if (
                this.original_customer_id !==
                this.submitForm.value.customer_ctrl.id
            ) {
                this.submitForm.patchValue({
                    hasCustomerChange: 'YS',
                    old_customer_id: this.original_customer_id,
                });
            }
        }

        // testing

        const sale = plainToClass(Sale, this.submitForm.value);
        sale.customer_id = this.submitForm.value.customer_ctrl.id;

        const saleDetails = plainToClass(
            SaleDetail,
            this.submitForm.value.product_arr
        );

        // Main Submit to BE
        this._commonApiService.saveSaleOrder({ sale, saleDetails }).subscribe(
            (data) => {
                this.spinner.hide();

                if (data.status === 'success') {
                    this.invoice_id = data.id;
                    this.final_invoice_no = data.invoice_no;
                    this.clicked = false;

                    this._cdr.markForCheck();

                    if (action === 'add') {
                        this.cancel();

                        this.formRef.resetForm();
                        this.invoiceSuccess(this.invoice_id);
                        this.submitForm.patchValue({
                            invoice_date: new Date(),
                        });
                        // invoice add dialog
                    } else {
                        // Save as Draft & continue
                        //this.presentAlert('Saved to Draft!');
                        this.openSnackBar(
                            'INFO: Saved to Draft!',
                            '',
                            'mat-primary'
                        );
                        this.clicked = false;

                        this.id = data.id;
                        this.mode = 'edit';
                        this.listArr = [];
                        this.submitForm.patchValue({
                            invoice_no: data.invoice_no,
                            id: data.id,
                        });

                        this._commonApiService
                            .salesMasterData(data.id)
                            .subscribe((data2) => {
                                this.rawSalesData = data2;
                                this._cdr.markForCheck();
                                this.buildRawSaleData();
                            });

                        this.submitForm.markAsPristine();
                    }

                    if (navto === 'back' && this.sale_type === 'SI') {
                        this.stockIssuesDashboard();
                    } else if (navto === 'back' && this.sale_type === 'TI') {
                        this.salesDashboard();
                    }
                } else {
                    this.presentAlert(
                        'Error: Something went wrong Contact Admin!'
                    );
                }

                this._cdr.markForCheck();
            },
            (error) => {
                this.spinner.hide();
                this.clicked = false;
                this.cancel();

                this.formRef.resetForm();

                this.submitForm.patchValue({
                    invoice_date: new Date(),
                });
                this._cdr.markForCheck();
                this.presentAlert(
                    'Error: Something went wrong Contact Admin!!!'
                );
            }
        );
    }

    // Fn: to get & set invoice_no and invoice type
    getInvoiceSequence(invoice_type) {
        this._saleApiService
            .getNxtSaleInvoiceNo(invoice_type)
            .subscribe((data: any) => {
                this.submitForm.patchValue({
                    invoice_no: data,
                });

                this._cdr.markForCheck();
            });
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
                        this._router.navigateByUrl('/home/search-sales');
                    },
                },
            ],
        });

        await alert.present();
    }

    async presentConvertSaleConfirm() {
        const alert = await this.alertController.create({
            header: 'Confirm!',
            message: 'This change cannot be rolled back. Are you sure?',
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
                    text: 'Convert to sale',
                    handler: () => {
                        console.log('Confirm Okay');

                        this.convertToSale();
                    },
                },
            ],
        });

        await alert.present();
    }

    cancel() {
        this.customer_data = null;

        this.customer_name = '';
        this.is_customer_selected = false;
        this.editCompletedSales = false;
        this.listArr = [];

        this.total = '0.00';
        this.igs_t_Total = '0.00';
        this.cgs_t_Total = '0.00';
        this.sgs_t_Total = '0.00';

        this.customer_lis = null;
    }

    convertToSale() {
        // pass sale id and call backend
        // refresh the page with latest values (invoice # and inv type)

        this._commonApiService
            .convertToSale({
                center_id: this.user_data.center_id,
                id: this.id,
                old_invoice_no: this.submitForm.value.invoice_no,
                old_stock_issued_date: this.submitForm.value.invoice_date,
                customer_id: this.submitForm.value.customer_ctrl.id,
                net_total: this.submitForm.value.net_total,
            })
            .subscribe((data: any) => {
                console.log('object');

                if (data.body.result === 'success') {
                    this.convertToInvoiceSuccess(
                        data.body.invoiceNo,
                        moment().format('DD-MM-YYYY')
                    );
                }
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
            .deleteSalesDetails({
                id: elem.id,
                sale_id: elem.sale_id,
                quantity: elem.quantity,
                product_id: elem.product_id,
                stock_id: elem.stock_id,
                audit_needed: this.editCompletedSales,
                center_id: this.user_data.center_id,
                mrp: elem.mrp,
            })
            .subscribe((data: any) => {
                debugger;
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
        const modalTax = await this._modalController.create({
            component: ChangeTaxComponent,
            componentProps: { pArry: this.listArr, rArray: this.removeRowArr },
            cssClass: 'tax-edit-modal',
        });

        // after permanent or tax change reload the igs_t,sgs_t,cgs_t as per new tax slab
        modalTax.onDidDismiss().then((result) => {
            console.log('The result:', result);

            if (result.data !== undefined) {
                const myCheckboxes = this.myCheckboxes.toArray();

                this.removeRowArr.forEach((idx) => {
                    this.listArr[idx].tax = +result.data;

                    if (this.igs_t) {
                        this.listArr[idx].igs_t = +result.data;
                    } else {
                        this.listArr[idx].sgs_t = +result.data / 2;
                        this.listArr[idx].cgs_t = +result.data / 2;
                    }

                    this.listArr[idx].checkbox = false;
                    myCheckboxes[idx].checked = false;

                    this.qtyChange(idx);
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

        modalTax.onDidDismiss().then((result) => {
            console.log('The result:', result);

            if (result.data !== undefined) {
                const myCheckboxes = this.myCheckboxes.toArray();

                this.removeRowArr.forEach((idx) => {
                    this.listArr[idx].mrp = result.data;
                    this.listArr[idx].checkbox = false;
                    myCheckboxes[idx].checked = false;
                    this.listArr[idx].mrp_change_flag = 'Y';

                    this.qtyChange(idx);
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
        this.maxOrderDate = $event.target.value;
    }

    clearProdInput() {
        this.submitForm.patchValue({
            product_ctrl: null,
            temp_desc: null,
            temp_mrp: 0,
            temp_qty: 1,
        });
        this.product_lis = null;
        this.selected_description = '';
        this.selected_mrp = '';
        this._cdr.markForCheck();
    }

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
                            if (this.p_list !== undefined) {
                                this.p_list.nativeElement.focus();
                                this.p_list.nativeElement.select();
                            }
                        },
                    },
                    {
                        text: 'Edit Item Row',

                        cssClass: 'secondary',
                        handler: (blah) => {
                            this.clearProdInput();

                            setTimeout(() => {
                                this.paraElements[index].focus();

                                this.paraElements[index].select();
                            }, 10);
                        },
                    },
                    {
                        text: 'Continue to Add',
                        cssClass: 'primary',
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
            this.submitForm.patchValue({
                temp_desc: event.description,
                temp_qty: event.packet_size === 0 ? 1 : event.packet_size,
                temp_mrp: event.mrp,
            });
            this.lineItemData = event;
            this.selected_description = event.description;
            this.selected_mrp = event.mrp;
        } else {
            this.submitForm.patchValue({
                temp_desc: event.option.value.description,
                temp_qty:
                    event.option.value.packet_size === 0
                        ? 1
                        : event.option.value.packet_size,
                temp_mrp: event.option.value.mrp,
            });
            this.lineItemData = event.option.value;
            this.selected_description = event.option.value.description;
            this.selected_mrp = event.option.value.mrp;

            setTimeout(() => {
                if (this.qty !== undefined) {
                    this.qty.nativeElement.focus();
                }
            }, 10);
        }
        if (this.qty !== undefined) {
            this.qty.nativeElement.focus();
        }
    }

    displayFn(obj: any): string | undefined {
        return obj && obj.name ? obj.name : undefined;
    }

    displayProdFn(obj: any): string | undefined {
        return obj && obj.product_code ? obj.product_code : undefined;
    }

    getLength() {
        const control = this.submitForm.controls.product_arr as FormArray;
        return control.length;
    }

    searchProducts() {
        let inv_dt = '';
        if (this.submitForm.value.invoice_date === null) {
            inv_dt = moment().format('DD-MM-YYYY');
        } else {
            inv_dt = moment(this.submitForm.value.invoice_date).format(
                'DD-MM-YYYY'
            );
        }

        this.submitForm.controls.product_ctrl.valueChanges
            .pipe(
                debounceTime(300),
                tap(() => (this.isLoading = true)),
                switchMap((id: any) => {
                    if (id != null && id.length >= 1) {
                        return this._commonApiService.getProductInformation({
                            center_id: this.user_data.center_id,
                            customer_id: this.customer_data.id,
                            order_date: inv_dt,
                            search_text: id,
                        });
                    } else {
                        return EMPTY;
                    }
                })
            )

            .subscribe((data: IProductSearchDto[]) => {
                this.isLoading = false;
                this.product_lis = data;

                this._cdr.markForCheck();
            });
    }

    // Navigation
    salesDashboard() {
        this._router.navigateByUrl('/home/search-sales');
    }

    stockIssuesDashboard() {
        this._router.navigateByUrl('/home/search-stock-issues');
    }

    async add($event) {
        $event.preventDefault();

        let inv_dt = '';
        if (this.submitForm.value.invoice_date === null) {
            inv_dt = moment().format('DD-MM-YYYY');
        } else {
            inv_dt = moment(this.submitForm.value.invoice_date).format(
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
            this.submitForm.value.temp_qty === '' ||
            this.submitForm.value.temp_qty === null ||
            this.submitForm.value.temp_qty === 0
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
            this.submitForm.value.customer_ctrl === null
        ) {
            this.submitForm.controls.customer_ctrl.setErrors({
                required: true,
            });
            this.submitForm.controls.customer_ctrl.markAsTouched();

            return false;
        }

        // this line over writes default qty vs entered qty
        this.lineItemData.quantity = this.submitForm.value.temp_qty;
        this.lineItemData.mrp = this.submitForm.value.temp_mrp;

        this.itemAdd();
    }

    itemAdd() {
        // line_item_data is the input box row to add items
        this.processItems(this.lineItemData, 'loading_now');

        this.submitForm.patchValue({
            product_ctrl: '',
            temp_desc: '',
            temp_mrp: 0,
            temp_qty: 1,
        });

        this.submitForm.controls.temp_desc.setErrors(null);
        this.submitForm.controls.temp_qty.setErrors(null);
        this.submitForm.controls.temp_mrp.setErrors(null);
        this.submitForm.controls.product_ctrl.setErrors(null);
        if (this.p_list !== undefined) {
            this.p_list.nativeElement.focus();
        }

        this.selected_description = '';
        this.selected_mrp = '';

        this._cdr.markForCheck();
    }

    setCustomerInfo(event, from) {
        if (event !== undefined) {
            this.is_customer_selected = true;
            if (from === 'tab') {
                this.customer_state_code = event.code;

                this.customer_data = event;

                if (this.customer_data.name === 'Walk In') {
                    this.isRetailCustomer = 'Y';
                } else {
                    this.isRetailCustomer = 'N';
                }

                this._cdr.detectChanges();
                this.setTaxLabel(this.customer_state_code);
            } else {
                this.customer_state_code = event.option.value.code;

                this.customer_data = event.option.value;

                if (this.customer_data.name === 'Walk In') {
                    this.isRetailCustomer = 'Y';
                } else {
                    this.isRetailCustomer = 'N';
                }

                this._cdr.detectChanges();
                this.setTaxLabel(this.customer_state_code);
                if (this.p_list) {
                    this.p_list.nativeElement.focus();
                }
            }

            if (this.selItemCode !== undefined) {
                this.selItemCode.nativeElement.focus();
            }
        }
    }

    openDialog(event): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '600px';
        dialogConfig.height = '100%';
        dialogConfig.data = this.customer_data;
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            CustomerViewDialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed');
        });
    }

    addCustomer() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '500px';
        dialogConfig.height = '100%';
        dialogConfig.position = { top: '0', right: '0' };
        dialogConfig.panelClass = 'app-full-bleed-dialog';

        const dialogRef = this._dialog.open(
            CustomerAddDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    this.clearInput();
                    this.openSnackBar(
                        'INFO: Customer added successfully!',
                        '',
                        'mat-primary'
                    );
                }
            });
    }

    logScrolling(event) {
        if (this.autoTrigger1 && this.autoTrigger1.panelOpen) {
            this.autoTrigger1.closePanel();
        }

        if (this.prodCtrlTrigger && this.prodCtrlTrigger.panelOpen) {
            this.prodCtrlTrigger.closePanel();
        }
    }

    openSnackBar(message: string, action: string, color: string) {
        this._snackBar.open(message, action, {
            duration: 2000,
            panelClass: ['mat-toolbar', color],
        });
    }

    addProduct() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '50%';
        dialogConfig.height = '100%';
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            ProductAddDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    const dialogConfigSuccess = new MatDialogConfig();
                    dialogConfigSuccess.disableClose = false;
                    dialogConfigSuccess.autoFocus = true;
                    dialogConfigSuccess.width = '25%';
                    dialogConfigSuccess.height = '25%';
                    dialogConfigSuccess.data = 'Product added successfully';

                    const dialogRef1 = this._dialog.open(
                        SuccessMessageDialogComponent,
                        dialogConfigSuccess
                    );
                }
            });
    }

    ScrollToTop() {
        this.content.scrollToTop(1500);
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

    openManualInvoiceDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '600px';
        dialogConfig.height = '100%';
        dialogConfig.data = this.customer_data;
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            ManualInvoiceNumberDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data !== '') {
                    this.submitForm.patchValue({
                        inv_gen_mode: 'M',
                        invoice_no: data,
                    });

                    this.openSnackBar(
                        `INFO: Manual Invoice# ${data} Created!`,
                        '',
                        'mat-primary'
                    );
                    // set the inv_get_mode to 'M"
                }
            });
    }

    // @HostListener('window:beforeunload', ['$event'])
    // beforeUnloadHandler($event) {
    //   $event.returnValue = 'Your changes will not be saved';

    //   return true;
    // }
}

// @HostListener('unloaded')
// ngOnDestroy() {
//     console.log('Cleared');
// }
