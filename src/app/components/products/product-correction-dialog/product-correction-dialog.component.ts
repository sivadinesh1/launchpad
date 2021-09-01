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
import { NgForm } from '@angular/forms';

@Component({
	selector: 'app-product-correction-dialog',
	templateUrl: './product-correction-dialog.component.html',
	styleUrls: ['./product-correction-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCorrectionDialogComponent implements OnInit {
	isLinear = true;
	center_id: any;
	pexists = false;
	temppcode: any;

	brands$: Observable<any>;

	data: Product;

	submitForm: FormGroup;

	productinfo: any;

	product_id: any;

	loading = false;
	currentStep: any;

	stocklist: any;

	selecteditem: any;

	selected = 'Others';
	selreason = false;

	val = {
		qty: '0',
	};

	constructor(
		private _formBuilder: FormBuilder,
		private _router: Router,
		private _route: ActivatedRoute,
		private _cdr: ChangeDetectorRef,
		@Inject(MAT_DIALOG_DATA) product: Product,
		private _commonApiService: CommonApiService,
		private dialogRef: MatDialogRef<ProductCorrectionDialogComponent>,
		private _authservice: AuthenticationService,
	) {
		// checkda
		const currentUser = this._authservice.currentUserValue;
		this.center_id = currentUser.center_id;
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

		this._commonApiService.getProductStockWithAllMRP(this.data.product_id).subscribe((data: any) => {
			this.stocklist = data.result;

			this._cdr.markForCheck();
		});
	}

	delete(item) {
		this._commonApiService.deleteProductFromStock(item.product_id, item.mrp, this.center_id).subscribe((data: any) => {
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
		this.selreason = true;
	}

	correct(item) {
		this.selecteditem = item;
	}

	update(loginForm: NgForm) {
		console.log(loginForm.value, loginForm.valid);

		console.log(loginForm.value.qty);
		console.log('selected item ' + JSON.stringify(this.selecteditem));

		let submitForm = {
			stock_id: this.selecteditem.stock_id,
			product_id: this.selecteditem.product_id,
			mrp: this.selecteditem.mrp,
			available_stock: +this.selecteditem.available_stock,
			corrected_stock: loginForm.value.qty,
			reason: this.selected,
			center_id: this.center_id,
		};

		this._commonApiService.stockCorrection(submitForm).subscribe((data: any) => {
			if (data.body.result === 'updated') {
				this.dialogRef.close('success');
			}

			this._cdr.markForCheck();
		});
	}

	clear() {
		this.selecteditem = null;
	}
}
