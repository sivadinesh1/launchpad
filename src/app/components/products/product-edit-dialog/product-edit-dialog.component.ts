import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { CommonApiService } from 'src/app/services/common-api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { patternValidator } from 'src/app/util/validators/pattern-validator';
import { HSNCODE_REGEX, DISC_REGEX } from 'src/app/util/helper/patterns';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from 'src/app/models/Product';

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

	product: Product;

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
		@Inject(MAT_DIALOG_DATA) product: Product,
		private _commonApiService: CommonApiService,
		private dialogRef: MatDialogRef<ProductEditDialogComponent>,
		private _authservice: AuthenticationService
	) {
		// checkda
		const currentUser = this._authservice.currentUserValue;
		this.center_id = currentUser.center_id;
		this.currentStep = 0;
		this.product = product;

		this.brands$ = this._commonApiService.getAllActiveBrands(this.center_id, 'A');

		this.submitForm = this._formBuilder.group({
			product_id: [this.product.product_id],
			center_id: [this.center_id],
			product_code: [this.product.product_code, Validators.required],
			description: [this.product.description, Validators.required],
			brand_id: [this.product.brand_id, Validators.required],

			unit: [this.product.uom, Validators.required],
			packetsize: [this.product.packetsize, Validators.required],
			hsncode: [this.product.hsncode, [patternValidator(HSNCODE_REGEX)]],
			taxrate: [this.product.taxrate.toString(), Validators.required],
			minqty: [this.product.minqty === null ? 0 : this.product.minqty, Validators.required],

			unit_price: [this.product.unit_price],
			mrp: [this.product.mrp, Validators.required],
			purchase_price: [this.product.purchase_price, Validators.required],
			salesprice: [this.product.salesprice],
			maxdiscount: [this.product.maxdiscount, [patternValidator(DISC_REGEX)]],

			currentstock: [this.product.currentstock],
			rackno: [this.product.rackno],
			location: [null],
			alternatecode: [null],
			reorderqty: [0],
			avgpurprice: [0],
			avgsaleprice: [0],
			itemdiscount: [0],
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

		this._commonApiService.updateProduct(this.submitForm.value).subscribe((data: any) => {
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
			this._commonApiService.isProdExists(this.submitForm.value.product_code, this.center_id).subscribe((data: any) => {
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
