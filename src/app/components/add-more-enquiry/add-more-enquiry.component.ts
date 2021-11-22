import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewChild,
    ChangeDetectorRef,
    Inject,
    AfterViewInit,
} from '@angular/core';
import {
    FormGroup,
    NgForm,
    FormBuilder,
    FormArray,
    Validators,
    FormControl,
} from '@angular/forms';
import {
    MatDialog,
    MAT_DIALOG_DATA,
    MatDialogRef,
} from '@angular/material/dialog';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonApiService } from 'src/app/services/common-api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CurrencyPadComponent } from '../currency-pad/currency-pad.component';
import { IProduct } from 'src/app/models/Product';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { RequireMatch as RequireMatch } from '../../util/directives/requireMatch';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { empty } from 'rxjs';

@Component({
    selector: 'app-add-more-enquiry',
    templateUrl: './add-more-enquiry.component.html',
    styleUrls: ['./add-more-enquiry.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMoreEnquiryComponent implements OnInit, AfterViewInit {
    @ViewChild('myForm', { static: true }) myForm: NgForm;

    // TAB navigation for product list
    @ViewChild('typeHead', { read: MatAutocompleteTrigger })
    autoTrigger: MatAutocompleteTrigger;

    @ViewChild('plist', { static: true }) plist: any;

    submitForm: FormGroup;

    customerAdded = false;
    customerData: any;

    removeRowArr = [];
    showDelIcon = false;
    center_id: any;
    user_id: any;

    data: any;
    isLoading = false;
    product_lis: IProduct[];

    constructor(
        private _fb: FormBuilder,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) data: any,
        private dialogRef: MatDialogRef<AddMoreEnquiryComponent>,

        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        private _commonApiService: CommonApiService,
        private _authService: AuthenticationService
    ) {
        this.submitForm = this._fb.group({
            enquiry_id: [data.enquiry_id, Validators.required],
            customer: [data.customer_id, Validators.required],
            center_id: [data.center_id, Validators.required],
            product_ctrl: [null, [RequireMatch]],
            remarks: [''],

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

            product_arr: this._fb.array([]),
        });
        //console.log('object' + data);
    }

    ngOnInit() {
        this.init();
    }

    init() {
        this.customerData = '';
        this.customerAdded = false;

        this.searchProducts();

        // this.addProduct();
        // this.addProduct();
        // this.addProduct();
        // this.addProduct();
        // this.addProduct();

        this._cdr.markForCheck();
    }

    get product_arr(): FormGroup {
        return this.submitForm.get('product_arr') as FormGroup;
    }

    addProduct() {
        const control = this.submitForm.get('product_arr') as FormArray;
        control.push(this.initProduct());
        this._cdr.markForCheck();
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

    clearProdInput() {
        this.submitForm.patchValue({
            product_code: null,

            temp_desc: null,
            temp_qty: 1,
        });
        this.product_lis = null;
        this._cdr.markForCheck();
    }

    getLength() {
        const control = this.submitForm.get('product_arr') as FormArray;
        return control.length;
    }

    setItemDesc(event, from) {
        if (from === 'tab') {
            this.submitForm.patchValue({
                temp_desc: event.description,
            });
        } else {
            this.submitForm.patchValue({
                temp_desc: event.option.value.description,
            });
        }

        this._cdr.markForCheck();
    }

    onRemoveRows() {
        this.removeRowArr.sort(this.compare).reverse();
        this.removeRowArr.forEach((idx) => {
            this.onRemoveProduct(idx);
        });

        this.removeRowArr = [];
    }

    compare(a: number, b: number) {
        return a - b;
    }

    onRemoveProduct(idx) {
        const formArray = this.submitForm.get('product_arr') as FormArray;
        formArray.removeAt(idx);
    }

    checkedRow(idx: number) {
        const formArray = this.submitForm.get('product_arr') as FormArray;
        const faControl = formArray.controls[idx] as FormControl;

        if (!faControl.value.checkbox) {
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

    openCurrencyPad(idx) {
        const dialogRef = this.dialog.open(CurrencyPadComponent, {
            width: '400px',
        });

        dialogRef.afterClosed().subscribe((data) => {
            if (data !== undefined && data.length > 0 && data !== 0) {
                // const faControl = (<FormArray>this.submitForm.controls.product_arr).at(idx);
                // faControl.controls.quantity.setValue(data);
                const formArray = this.submitForm.get(
                    'product_arr'
                ) as FormArray;
                const faControl = formArray.controls[idx] as FormControl;
            }

            this._cdr.markForCheck();
        });
    }

    displayProdFn(obj: any): string | undefined {
        return obj && obj.product_code ? obj.product_code : undefined;
    }

    ngAfterViewInit() {
        this.autoTrigger.panelClosingActions.subscribe((x) => {
            if (this.autoTrigger.activeOption) {
                this.submitForm.patchValue({
                    product_ctrl: this.autoTrigger.activeOption.value,
                });
                this.setItemDesc(this.autoTrigger.activeOption.value, 'tab');
            }
        });
    }

    searchProducts() {
        let search = '';
        this.submitForm.controls.product_ctrl.valueChanges
            .pipe(
                debounceTime(300),
                tap(() => (this.isLoading = true)),
                switchMap((id: any) => {
                    console.log(id);
                    search = id;
                    if (id != null && id.length >= 0) {
                        return this._commonApiService.getProductInfo({
                            center_id: this.submitForm.value.center_id,
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

        const control = this.submitForm.get('product_arr') as FormArray;

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
        this.plist.nativeElement.focus();

        this._cdr.markForCheck();
    }

    onSubmit() {
        if (!this.submitForm.valid) {
            return false;
        }

        this._commonApiService
            .addMoreEnquiry(this.submitForm.value)
            .subscribe((data: any) => {
                this.submitForm.reset();
                this.myForm.resetForm();
                this.dialogRef.close('success');

                this._cdr.markForCheck();
            });
    }

    close() {
        this.dialogRef.close();
    }
}
