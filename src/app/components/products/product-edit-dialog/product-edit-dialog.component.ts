import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Inject,
} from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    Validators,
    AbstractControl,
} from '@angular/forms';
import { CommonApiService } from 'src/app/services/common-api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { patternValidator } from 'src/app/util/validators/pattern-validator';
import { HSN_CODE_REGEX, DISC_REGEX } from 'src/app/util/helper/patterns';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IProduct } from 'src/app/models/Product';

@Component({
    selector: 'app-product-edit-dialog',
    templateUrl: './product-edit-dialog.component.html',
    styleUrls: ['./product-edit-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditDialogComponent implements OnInit {
    isLinear = true;
    center_id: any;
    pexists = false;
    temppcode: any;

    brands$: Observable<any>;

    product: IProduct;

    submitForm: FormGroup;

    productinfo: any;

    product_id: any;

    loading = false;
    currentStep: any;

    uom = [
        { key: 'Nos', viewValue: 'Nos' },
        { key: 'Kg', viewValue: 'Kg' },
        { key: 'Ltrs', viewValue: 'Ltrs' },
        { key: 'pcs', viewValue: 'Pcs' },
    ];
    tax = [
        { key: '0', viewValue: '0' },
        { key: '5', viewValue: '5' },
        { key: '12', viewValue: '12' },
        { key: '18', viewValue: '18' },
        { key: '28', viewValue: '28' },
    ];
    constructor(
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) product: IProduct,
        private _commonApiService: CommonApiService,
        private dialogRef: MatDialogRef<ProductEditDialogComponent>,
        private _authService: AuthenticationService
    ) {
        // checkda
        const currentUser = this._authService.currentUserValue;
        this.center_id = currentUser.center_id;
        this.currentStep = 0;
        this.product = product;

        this.brands$ = this._commonApiService.getAllActiveBrands('A');

        this.submitForm = this._formBuilder.group({
            product_id: [this.product.id],
            center_id: [this.center_id],
            product_code: [this.product.product_code, Validators.required],
            product_description: [
                this.product.product_description,
                Validators.required,
            ],
            brand_id: [this.product.brand_id, Validators.required],

            unit: [this.product.uom, Validators.required],
            packet_size: [this.product.packet_size, Validators.required],
            hsn_code: [
                this.product.hsn_code,
                [patternValidator(HSN_CODE_REGEX)],
            ],
            tax_rate: [this.product.tax_rate.toString(), Validators.required],
            minimum_quantity: [
                this.product.minimum_quantity === null
                    ? 0
                    : this.product.minimum_quantity,
                Validators.required,
            ],

            unit_price: [this.product.unit_price],
            mrp: [this.product.mrp, Validators.required],
            purchase_price: [this.product.purchase_price, Validators.required],
            sales_price: [this.product.sales_price],
            max_discount: [
                this.product.max_discount,
                [patternValidator(DISC_REGEX)],
            ],

            current_stock: [this.product.current_stock],
            rack_info: [this.product.rack_info],
            location: [null],
            alternate_code: [null],
            reorder_quantity: [0],
            average_purchase_price: [0],
            average_sale_price: [0],
            item_discount: [0],
            margin: [0],
        });
    }

    ngOnInit() {
        this.dialogRef.keydownEvents().subscribe((event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });

        this.dialogRef.backdropClick().subscribe((event) => {
            this.close();
        });
    }

    submit() {
        this.submitForm.patchValue({
            unit_price: this.submitForm.value.purchase_price,
        });

        this._commonApiService
            .updateProduct(this.submitForm.value)
            .subscribe((data: any) => {
                if (data.body.result === 'success') {
                    this.dialogRef.close('success');
                    this.searchProducts();
                }
            });
    }

    addProduct() {
        this._router.navigate([`/home/product/add`]);
    }

    isProdExists() {
        if (this.submitForm.value.product_code.length > 0) {
            this._commonApiService
                .isProdExists(this.submitForm.value.product_code)
                .subscribe((data: any) => {
                    if (data.result.length > 0) {
                        if (data.result[0].id > 0) {
                            this.pexists = true;
                            this.temppcode = data.result[0];
                        }
                    } else {
                        this.pexists = false;
                    }

                    this._cdr.markForCheck();
                });
        }
    }

    searchProducts() {
        this._router.navigate([`/home/view-products`]);
    }

    close() {
        this.dialogRef.close();
    }
}
