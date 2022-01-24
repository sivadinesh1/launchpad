import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ElementRef,
    ViewChild,
    AfterViewInit,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    Validators,
    FormGroup,
    FormArray,
    NgForm,
} from '@angular/forms';
import { CurrencyPadComponent } from '../components/currency-pad/currency-pad.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalController, AlertController } from '@ionic/angular';

import { CommonApiService } from '../services/common-api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

import { EMPTY, Observable } from 'rxjs';
import {
    filter,
    map,
    startWith,
    debounceTime,
    switchMap,
    tap,
    finalize,
} from 'rxjs/operators';

import { User } from '../models/User';
import { Customer } from 'src/app/models/Customer';

import { RequireMatch as RequireMatch } from '../util/directives/requireMatch';
import { IProduct } from '../models/Product';
import { empty, of } from 'rxjs';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { CustomerViewDialogComponent } from '../components/customers/customer-view-dialog/customer-view-dialog.component';
import { IonContent } from '@ionic/angular';
import { CustomerAddDialogComponent } from '../components/customers/customer-add-dialog/customer-add-dialog.component';

@Component({
    selector: 'app-enquiry',
    templateUrl: './enquiry.page.html',
    styleUrls: ['./enquiry.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnquiryPage implements AfterViewInit {
    // TAB navigation for product list
    @ViewChild('typeHead', { read: MatAutocompleteTrigger })
    autoTrigger: MatAutocompleteTrigger;

    @ViewChild('cList', { static: true }) c_list: any;

    @ViewChild('plist', { static: true }) plist: any;
    @ViewChild('qty', { static: true }) qty: any;

    // TAB navigation for customer list
    @ViewChild('typeHead1', { read: MatAutocompleteTrigger })
    autoTrigger1: MatAutocompleteTrigger;

    @ViewChild(IonContent, { static: false }) content: IonContent;

    @ViewChild('myForm', { static: true }) myForm: NgForm;
    filteredCustomers: Observable<any[]>;

    submitForm: FormGroup;

    //customerAdded = false;
    customer_data: any;

    removeRowArr = [];
    showDelIcon = false;
    // center_id: any;
    tabIndex = 0;

    user_data$: Observable<User>;
    user_data: any;

    isLoading = false;
    isCLoading = false;
    customer_name: any;
    address1: any;
    address2: any;
    district: any;
    gst: any;
    phone: any;
    whatsapp: any;

    is_customer_selected = false;
    clicked = false;

    customer_lis: Customer[];
    product_lis: IProduct[];

    constructor(
        private _fb: FormBuilder,
        public dialog: MatDialog,
        public alertController: AlertController,

        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _commonApiService: CommonApiService,
        private _dialog: MatDialog,
        private _authService: AuthenticationService
    ) {
        this.basicInit();
        this.user_data$ = this._authService.currentUser;
        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this._authService.setCurrentMenu('ENQUIRY');
                this.user_data = data;

                this.submitForm.patchValue({
                    center_id: data.center_id,
                });

                //    this.init();
                this._cdr.markForCheck();
            });

        this._route.params.subscribe((params) => {
            this.clicked = false;
            if (this.user_data !== undefined) {
                this.basicInit();
                this.init();
                this.submitForm.patchValue({
                    center_id: this.user_data.center_id,
                });
            }
            this._cdr.markForCheck();
        });
    }

    basicInit() {
        this.submitForm = this._fb.group({
            customer_ctrl: [null, [Validators.required, RequireMatch]],

            product_ctrl: [null, [RequireMatch]],

            center_id: [null, Validators.required],
            remarks: [''],

            product_arr: this._fb.array([]),

            temp_desc: [''],

            temp_qty: [
                '1',
                [
                    Validators.required,
                    Validators.max(1000),
                    Validators.min(1),
                    Validators.pattern(/\-?\d*\.?\d{1,2}/),
                ],
            ],
        });
    }

    get product_arr(): FormGroup {
        return this.submitForm.get('product_arr') as FormGroup;
    }

    init() {
        this.clearInput();
        this.clearProdInput();
        this.searchCustomers();
        this.searchProducts();
        this._cdr.markForCheck();
    }

    searchCustomers() {
        let search = '';
        this.submitForm.controls.customer_ctrl.valueChanges
            .pipe(
                debounceTime(300),
                tap(() => (this.isCLoading = true)),
                switchMap((id: any) => {
                    search = id;
                    if (id != null && id.length >= 2) {
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

    // ScrollToBottom() {
    //   this.content.scrollToBottom(1500);
    // }

    // ScrollToTop() {
    //   this.content.scrollToTop(1500);
    // }

    ScrollToPoint(X, Y) {
        this.content.scrollToPoint(X, Y, 300);
    }

    setCustomerInfo(event, from) {
        if (from === 'click' && event.option.value === 'new') {
            this.addCustomer();
        }
        this.is_customer_selected = true;
        this._cdr.detectChanges();

        if (from === 'tab') {
            this.customer_data = event;
        } else {
            this.customer_data = event.option.value;
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            this.plist && this.plist.nativeElement.focus();
        }

        this._cdr.markForCheck();
    }

    addCustomer() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '80%';
        dialogConfig.height = '80%';

        const dialogRef = this._dialog.open(
            CustomerAddDialogComponent,
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
                        .getCustomerDetails(data.body.id)
                        .subscribe((customerData: any) => {
                            this.customer_data = customerData[0];

                            this.customer_name = customerData[0].name;
                            this.is_customer_selected = true;

                            this.setCustomerInfo(customerData[0], 'tab');

                            this.submitForm.patchValue({
                                customer_ctrl: customerData[0],
                            });

                            this.isCLoading = false;
                            this.autoTrigger1.closePanel();

                            this._cdr.markForCheck();
                        });
                } else {
                    this.is_customer_selected = false;
                    this.autoTrigger1.closePanel();

                    this._cdr.markForCheck();
                }

                this._cdr.markForCheck();
            });
    }

    getLength() {
        const control = this.submitForm.controls.product_arr as FormArray;
        return control.length;
    }

    searchProducts() {
        let search = '';
        this.submitForm.controls.product_ctrl.valueChanges
            .pipe(
                debounceTime(300),
                tap(() => (this.isLoading = true)),
                switchMap((id: any) => {
                    // console.log(id);
                    search = id;
                    if (id != null && id.length >= 2) {
                        return this._commonApiService.getProductInfo({
                            center_id: this.user_data.center_id,
                            search_text: id,
                        });
                    } else {
                        return EMPTY;
                    }
                })
            )

            .subscribe((data: any) => {
                this.isLoading = false;
                this.product_lis = data.body.result;
                this._cdr.markForCheck();
            });
    }

    initProduct() {
        return this._fb.group({
            checkbox: [false],
            product_code: [''],
            notes: ['', Validators.required],
            quantity: [
                1,
                [
                    Validators.required,
                    Validators.max(1000),
                    Validators.min(1),
                    Validators.pattern(/\-?\d*\.?\d{1,2}/),
                ],
            ],
        });
    }

    ngAfterViewInit() {
        this.searchCustomers();
        this.searchProducts();

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
                        customer_ctrl: this.autoTrigger1.activeOption.value,
                    });
                    this.setCustomerInfo(
                        this.autoTrigger1.activeOption.value,
                        'tab'
                    );
                }
            });

        setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            this.c_list && this.c_list.nativeElement.focus();
            this._cdr.detectChanges();
        });
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

    add() {
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
            this.submitForm.value.temp_qty === null
        ) {
            this.submitForm.controls.temp_qty.setErrors({ required: true });
            this.submitForm.controls.temp_qty.markAsTouched();

            return false;
        }

        const control = this.submitForm.controls.product_arr as FormArray;

        // DnD insert adds new row in starting of the array {idx : 0}
        // control.insert(0, this._fb.group({

        control.push(
            this._fb.group({
                checkbox: [false],
                product_code: [
                    this.submitForm.value.product_ctrl === null
                        ? ''
                        : this.submitForm.value.product_ctrl.product_code,
                ],

                notes: [this.submitForm.value.temp_desc, Validators.required],
                quantity: [
                    this.submitForm.value.temp_qty,
                    [
                        Validators.required,
                        Validators.max(1000),
                        Validators.min(1),
                        Validators.pattern(/\-?\d*\.?\d{1,2}/),
                    ],
                ],
            })
        );

        this.submitForm.patchValue({
            product_ctrl: '',
            temp_desc: '',
            temp_qty: 1,
        });

        this.submitForm.controls.temp_desc.setErrors(null);
        this.submitForm.controls.temp_qty.setErrors(null);
        this.submitForm.controls.product_ctrl.setErrors(null);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.plist && this.plist.nativeElement.focus();

        const v1 = 240 + control.length * 70 + 70;

        this.ScrollToPoint(0, v1);

        this._cdr.markForCheck();
    }

    filterCustomer(value: any) {
        if (typeof value == 'object') {
            return this.customer_lis.filter((customer) =>
                customer.name.toLowerCase().match(value.name.toLowerCase())
            );
        } else if (typeof value == 'string') {
            return this.customer_lis.filter((customer) =>
                customer.name.toLowerCase().match(value.toLowerCase())
            );
        }
    }

    clearInput() {
        this.submitForm.patchValue({
            customer_ctrl: null,
        });
        this.is_customer_selected = false;
        this.customer_lis = null;
        this.address1 = null;
        this.address2 = null;
        this.district = null;
        this.gst = null;
        this.phone = null;
        this.whatsapp = null;
        this.is_customer_selected = false;
        this._cdr.markForCheck();
    }

    clearProdInput() {
        this.submitForm.patchValue({
            product_ctrl: null,

            temp_desc: null,
            temp_qty: 1,
        });
        this.product_lis = null;
        this._cdr.markForCheck();
    }

    onRemoveRows() {
        this.removeRowArr.sort(this.compare).reverse();
        this.removeRowArr.forEach((idx) => {
            this.onRemoveProduct(idx);
        });

        this.removeRowArr = [];
        this.delIconStatus();
    }

    compare(a: number, b: number) {
        return a - b;
    }

    onRemoveProduct(idx) {
        console.log('object ' + this.removeRowArr);

        const formArray = this.submitForm.get('product_arr') as FormArray;
        formArray.removeAt(idx);
    }

    checkedRow(idx: number, $event) {
        // const faControl = (<FormArray>this.submitForm.controls.product_arr).at(
        //   idx
        // );
        // faControl.controls.checkbox;

        const formArray = this.submitForm.get('product_arr') as FormArray;
        const faControl = formArray.controls[idx] as FormControl;

        if (faControl.value.checkbox) {
            this.removeRowArr.push(idx);
        } else {
            this.removeRowArr = this.removeRowArr.filter((e) => e !== idx);
        }
        this.delIconStatus();
        console.log('object..' + this.removeRowArr);
    }

    delIconStatus() {
        if (this.removeRowArr.length > 0) {
            this.showDelIcon = true;
        } else {
            this.showDelIcon = false;
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

    onSubmit() {
        if (this.getLength() === 0) {
            return this.presentAlert('No products added to save!');
        }

        if (!this.submitForm.valid) {
            return false;
        }

        //main submit
        this.clicked = true; // disable all buttons after submission
        this._cdr.markForCheck();
        this._commonApiService
            .saveEnquiry(this.submitForm.value)
            .subscribe((data: any) => {
                console.log('object.SAVE ENQ. ' + JSON.stringify(data));

                if (data.body.result === 'success') {
                    this.clearInput();
                    this.clearProdInput();

                    const control = this.submitForm.get(
                        'product_arr'
                    ) as FormArray;

                    control.clear();

                    this.submitForm.reset();
                    this.myForm.resetForm();

                    this.submitForm.patchValue({
                        center_id: data.center_id,
                    });

                    this._router.navigate([
                        `/home/enquiry/open-enquiry/O/weekly`,
                    ]);
                } else {
                }

                this._cdr.markForCheck();
            });
    }

    reset() {
        this.clearInput();
        this.clearProdInput();

        const control = this.submitForm.get('product_arr') as FormArray;
        control.clear();

        this.submitForm.reset();
        this.myForm.resetForm();
    }

    async presentAlertConfirm() {
        const alert = await this.alertController.create({
            header: 'Confirm!',
            message: 'Are you sure to clear Inquiry data? ',
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
                    text: 'Yes, Proceed',
                    handler: () => {
                        console.log('Confirm Okay');

                        this.reset();
                    },
                },
            ],
        });

        await alert.present();
    }

    openEnquiry() {
        this._router.navigateByUrl('/home/enquiry/open-enquiry/O/weekly');
    }

    openBackOrder() {
        this._router.navigateByUrl('/home/enquiry/back-order');
    }

    displayFn(obj: any): string | undefined {
        return obj && obj.name ? obj.name : undefined;
    }

    displayProdFn(obj: any): string | undefined {
        return obj && obj.product_code ? obj.product_code : undefined;
    }

    setItemDesc(event, from) {
        if (from === 'tab') {
            this.submitForm.patchValue({
                temp_desc: event.product_description,
            });
        } else {
            this.submitForm.patchValue({
                temp_desc: event.option.value.product_description,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            this.qty && this.qty.nativeElement.focus();
        }

        this._cdr.markForCheck();
    }

    logScrolling(event) {
        if (this.autoTrigger1 && this.autoTrigger1.panelOpen) {
            this.autoTrigger1.closePanel();
        }

        if (this.autoTrigger && this.autoTrigger.panelOpen) {
            this.autoTrigger.closePanel();
        }
    }
}
