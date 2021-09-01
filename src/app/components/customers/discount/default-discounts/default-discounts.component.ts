import {
	Component,
	OnInit,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
	ViewChild,
	Inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User';

import { NullToQuotePipe } from 'src/app/util/pipes/null-quote.pipe';
import { AlertController } from '@ionic/angular';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Customer } from 'src/app/models/Customer';
import { NavigationService } from 'src/app/services/navigation.service';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
	selector: 'app-default-discounts',
	templateUrl: './default-discounts.component.html',
	styleUrls: ['./default-discounts.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultDiscountsComponent implements OnInit {
	center_id: any;
	vendor_id: any;
	resultList: any;
	submitForm: FormGroup;

	isLinear = true;
	customer_id: any;

	// only 2 type of discount
	discountType = ['NET', 'GROSS'];

	userdata$: Observable<User>;
	userdata: any;
	ready = 0; // flag check - centerid (localstorage) & customerid (param)
	selectedDiscType = 'NET'; // default
	selectedEffDiscStDate: any;

	objForm = [];
	@ViewChild('myForm', { static: true }) myForm: NgForm;
	initialValues: any;
	customerName: string;

	elements: any;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _fb: FormBuilder,
		private dialogRef: MatDialogRef<DefaultDiscountsComponent>,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		@Inject(MAT_DIALOG_DATA) elements: any,
		public alertController: AlertController,
		public _navigationService: NavigationService,
		private _commonApiService: CommonApiService
	) {
		this.elements = elements;

		const currentUser = this._authservice.currentUserValue;
		this.center_id = currentUser.center_id;

		this.submitForm = this._fb.group({
			customer_id: [this.elements.id],
			center_id: [this.center_id],
			brand_id: [0],
			disctype: [this.elements.type, Validators.required],
			effDiscStDate: new Date(
				new NullToQuotePipe()
					.transform(this.elements.startdate)
					.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')
			),
			gstzero: [this.elements.gstzero, Validators.required],
			gstfive: [this.elements.gstfive, Validators.required],
			gsttwelve: [this.elements.gsttwelve, Validators.required],
			gsteighteen: [this.elements.gsteighteen, Validators.required],
			gsttwentyeight: [this.elements.gsttwentyeight, Validators.required],
		});
	}

	ngOnInit() {
		this.init();
	}

	init() {}

	// discount date selection
	handleDicountDateChange(event) {
		this.submitForm.patchValue({
			effDiscStDate: event.target.value,
		});
		this._cdr.markForCheck();
	}

	submit() {
		if (!this.submitForm.valid) {
			return false;
		}

		// update discount table, currently only one set of values.
		// FTRIMPL - date based discounts
		this._commonApiService
			.updateDefaultCustomerDiscount(this.submitForm.value)
			.subscribe((data: any) => {
				// if successfully update
				if (data.body === 1) {
					this.dialogRef.close(data);
				}
			});
	}

	reset() {
		this.submitForm.reset(this.initialValues);
	}

	close() {
		this.dialogRef.close();
	}
}
