import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

import { Validators, FormBuilder } from '@angular/forms';

import { CommonApiService } from 'src/app/services/common-api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { LoadingService } from '../../loading/loading.service';
import { Brand } from 'src/app/models/Brand';

@Component({
	selector: 'app-brand-dialog',
	templateUrl: './brand-edit-dialog.component.html',
	styleUrls: ['./brand-edit-dialog.component.scss'],
	providers: [LoadingService],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandEditDialogComponent implements OnInit {
	center_id: any;
	submitForm: any;
	brand: Brand;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) brand: Brand,
		private dialogRef: MatDialogRef<BrandEditDialogComponent>,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		private _loadingService: LoadingService,
		private _commonApiService: CommonApiService
	) {
		const currentUser = this._authservice.currentUserValue;
		this.center_id = currentUser.center_id;

		this.brand = brand;

		this.submitForm = this._formBuilder.group({
			brand_id: [this.brand.id],
			center_id: [this.center_id],
			name: [this.brand.name, Validators.required],
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
		if (!this.submitForm.valid) {
			return false;
		}

		const changes = this.submitForm.value;
		const updateBrand$ = this._commonApiService.updateBrand(this.brand.id, changes);

		this._loadingService.showLoaderUntilCompleted(updateBrand$).subscribe((data: any) => {
			console.log('object.. brand updated ..');
			this.dialogRef.close('success');
		});
	}

	searchBrands() {
		this._router.navigate([`/home/view-brands`]);
	}

	addBrand() {
		this._router.navigate([`/home/brand/add`]);
	}

	close() {
		this.dialogRef.close();
	}
}

// dnd
//   (this.submitForm.get('formArray')).get([0]).patchValue({ 'name': this.resultList.name });
