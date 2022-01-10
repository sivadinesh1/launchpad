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
import { NgForm } from '@angular/forms';
import { plainToClass } from 'class-transformer';
import { Stock } from 'src/app/models/Stock';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
    selector: 'app-product-correction-dialog',
    templateUrl: './product-correction-dialog.component.html',
    styleUrls: ['./product-correction-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCorrectionDialogComponent implements OnInit {
    isLinear = true;
    // center_id: any;
    pexists = false;
    temppcode: any;

    brands$: Observable<any>;

    data: IProduct;

    submitForm: FormGroup;

    product_info: any;

    product_id: any;

    loading = false;
    currentStep: any;

    stock_list_array: any;

    selected_item: any;

    selected = 'Others';
    selected_reason = false;

    val = {
        qty: '0',
    };

    constructor(
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) product: IProduct,
        private _commonApiService: CommonApiService,
        private dialogRef: MatDialogRef<ProductCorrectionDialogComponent>,
        private _authService: AuthenticationService,
        private _loadingService: LoadingService
    ) {
        // checkda
        const currentUser = this._authService.currentUserValue;
        //this.center_id = currentUser.center_id;
        this.currentStep = 0;
        this.data = product;
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

        this._commonApiService
            .getProductStockWithAllMRP(this.data.id)
            .subscribe((data: any) => {
                this.stock_list_array = data;

                this._cdr.markForCheck();
            });
    }

    deactivate(item) {
        this._commonApiService
            .deleteProductFromStock(item.product_id, item.mrp, 'I')
            .subscribe((data: any) => {
                this.dialogRef.close('success');
            });
    }

    activate(item) {
        this._commonApiService
            .deleteProductFromStock(item.product_id, item.mrp, 'A')
            .subscribe((data: any) => {
                this.dialogRef.close('success');
            });
    }

    submit() {}

    addProduct() {
        this._router.navigate([`/home/product/add`]);
    }

    searchProducts() {
        this._router.navigate([`/home/view-products`]);
    }

    close() {
        this.dialogRef.close();
    }

    handleChange(event) {
        this.selected_reason = true;
    }

    correct(item) {
        this.selected_item = item;
    }

    update(loginForm: NgForm) {
        console.log(loginForm.value, loginForm.valid);

        console.log(loginForm.value.qty);
        console.log('selected item ' + JSON.stringify(this.selected_item));

        if (!this.selected_reason) {
            // throw snack error
            this._loadingService.openSnackBar(
                'Select a reason for correction',
                '',
                'mat-warn'
            );
            return false;
        }

        const submitForm = {
            id: this.selected_item.stock_id,
            product_id: this.selected_item.product_id,
            mrp: this.selected_item.mrp,
            available_stock: +this.selected_item.available_stock,
            corrected_stock: loginForm.value.qty,
            reason: this.selected,
            // center_id: this.center_id,
        };

        const stock = plainToClass(Stock, submitForm);

        this._commonApiService.stockCorrection(stock).subscribe((data: any) => {
            if (data.body.result.count > 0) {
                this.dialogRef.close('success');
            }

            this._cdr.markForCheck();
        });
    }

    clear() {
        this.selected_item = null;
    }
}
