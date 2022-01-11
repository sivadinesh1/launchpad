import { User } from '../../../models/User';
import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { throwError, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonApiService } from 'src/app/services/common-api.service';
import {
    HSN_CODE_REGEX,
    DISC_REGEX,
    TWO_DECIMAL_REGEX,
} from 'src/app/util/helper/patterns';
import { patternValidator } from 'src/app/util/validators/pattern-validator';

import { MessagesService } from '../../../components/messages/messages.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { MatDialogRef } from '@angular/material/dialog';
import { LoadingService } from 'src/app/services/loading.service';
import { IProduct, Product } from 'src/app/models/Product';
import { plainToClass } from 'class-transformer';

@Component({
    selector: 'app-product-add-dialog',
    templateUrl: './product-add-dialog.component.html',
    styleUrls: ['./product-add-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAddDialogComponent implements OnInit {
    isLinear = true;
    center_id: any;
    brands: any;

    submitForm: FormGroup;
    product_exists = false;
    prod_code: any;

    temp_product_code: any;
    user_data$: Observable<User>;
    user_data: any;

    uom = [
        { key: 'Nos', viewValue: 'Nos' },
        { key: 'Kg', viewValue: 'Kg' },
        { key: 'Litres', viewValue: 'Litres' },
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
        { name: 'Consumable', id: 'C', checked: false },
    ];

    constructor(
        private _formBuilder: FormBuilder,
        private _commonApiService: CommonApiService,
        private _cdr: ChangeDetectorRef,
        private dialogRef: MatDialogRef<ProductAddDialogComponent>,
        private _router: Router,
        private _loadingService: LoadingService,
        private _authService: AuthenticationService
    ) {
        this.submitForm = this._formBuilder.group({
            product_type: ['P'],
            center_id: [],
            product_code: ['', Validators.required],
            product_description: ['', Validators.required],
            brand_id: ['', Validators.required],
            uom: ['', Validators.required],
            unit_price: [''],
            packet_size: ['', Validators.required],
            hsn_code: [''],

            tax_rate: ['', Validators.required],
            minimum_quantity: [0, Validators.required],

            mrp: ['', Validators.required],
            purchase_price: ['', Validators.required],
            max_discount: [''],

            current_stock: ['', Validators.required],
            rack_info: [''],
        });

        this.user_data$ = this._authService.currentUser;
        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.user_data = data;
                this.center_id = this.user_data.center_id;
                this.submitForm.patchValue({
                    center_id: this.user_data.center_id,
                });

                this._commonApiService
                    .getAllActiveBrands('A')
                    .subscribe((data1) => {
                        this.brands = data1;
                    });

                this._cdr.markForCheck();
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

    onSubmit() {
        this.submitForm.markAllAsTouched();

        if (!this.submitForm.valid) {
            this._loadingService.openSnackBar(
                'Missing required field(s).',
                '',
                'mat-warn'
            );
            this._cdr.markForCheck();
            return false;
        } else {
            // assign PP to UP (until strong use case arise)
            this.submitForm.patchValue({
                unit_price: this.submitForm.value.purchase_price,
            });
        }

        this.checkAndAdd();
    }

    checkAndAdd() {
        this.product_exists = false;

        if (this.submitForm.value.product_code.length > 0) {
            this._commonApiService
                .isProdExists(this.submitForm.value.product_code)
                .subscribe((data2: any) => {
                    if (data2.status === 'true') {
                        this.product_exists = true;

                        this._loadingService.openSnackBar(
                            'Duplicate Product Code',
                            '',
                            'mat-warn'
                        );
                    } else {
                        this.addProduct();
                        this.product_exists = false;
                    }

                    this._cdr.markForCheck();
                });
        }
    }

    addProduct() {
        const product = plainToClass(Product, this.submitForm.value);

        this._commonApiService.addProduct(product).subscribe((data3: any) => {
            if (data3.status === 201) {
                this.dialogRef.close('success');
            }
        });
    }

    goProdEdit() {
        this._router.navigate([
            `/home/product/edit/${this.temp_product_code.center_id}/${this.temp_product_code.id}`,
        ]);
    }

    close() {
        this.dialogRef.close();
    }
}
