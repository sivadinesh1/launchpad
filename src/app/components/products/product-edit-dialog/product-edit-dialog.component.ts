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
import { IProduct, Product } from 'src/app/models/Product';
import { plainToClass } from 'class-transformer';

@Component({
    selector: 'app-product-edit-dialog',
    templateUrl: './product-edit-dialog.component.html',
    styleUrls: ['./product-edit-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditDialogComponent implements OnInit {
    isLinear = true;
    center_id: any;
    product_exists = false;
    temp_product_code: any;

    brands$: Observable<any>;

    product: IProduct;

    submitForm: FormGroup;

    product_info: any;

    product_id: any;

    loading = false;
    currentStep: any;

    uom = [
        { key: 'Nos', viewValue: 'Nos' },
        { key: 'Kg', viewValue: 'Kg' },
        { key: 'Litres', viewValue: 'litres' },
        { key: 'pcs', viewValue: 'Pcs' },
    ];
    tax = [
        { key: '0', viewValue: '0' },
        { key: '5', viewValue: '5' },
        { key: '12', viewValue: '12' },
        { key: '18', viewValue: '18' },
        { key: '28', viewValue: '28' },
    ];

    productType = [
        { name: 'Product', id: 'P', checked: true },
        { name: 'Service', id: 'S', checked: false },
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
        debugger;
        if (this.product.product_type === 'S') {
            this.productType[1].checked = true;
            this.productType[0].checked = false;
        }

        this.submitForm = this._formBuilder.group({
            id: [this.product.id],
            center_id: [this.center_id],
            product_type: [this.product.product_type],
            product_code: [this.product.product_code, Validators.required],
            product_description: [
                this.product.product_description,
                Validators.required,
            ],
            brand_id: [this.product.brand_id.toString(), Validators.required],

            uom: [this.product.uom, Validators.required],
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
        const product = plainToClass(Product, this.submitForm.value);

        this.submitForm.patchValue({
            unit_price: this.submitForm.value.purchase_price,
        });

        this._commonApiService.updateProduct(product).subscribe((data: any) => {
            if (data.status === 200 && data.body.result === 'success') {
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
                            this.product_exists = true;
                            this.temp_product_code = data.result[0];
                        }
                    } else {
                        this.product_exists = false;
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
