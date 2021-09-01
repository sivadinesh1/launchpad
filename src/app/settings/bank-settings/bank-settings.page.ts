import { Component, OnInit, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { patternValidator } from 'src/app/util/validators/pattern-validator';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User';
import { filter } from 'rxjs/operators';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';

@Component({
	selector: 'app-bank-settings',
	templateUrl: './bank-settings.page.html',
	styleUrls: ['./bank-settings.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankSettingsPage implements OnInit {
	timezonesdata: any;
	submitForm: any;
	userdata$: Observable<User>;
	userdata: any;

	ready = 0;
	bankList: any;

	selectedItem = null;

	isAddBank = false;
	isEditBank = false;

	constructor(
		private _formBuilder: FormBuilder,
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _fb: FormBuilder,
		private _snackBar: MatSnackBar,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		private _commonApiService: CommonApiService,
	) {
		// init form
		this.submitForm = this._formBuilder.group({
			id: [],
			center_id: [],
			bankname: [],
			accountno: [],
			accountname: [],
			branchdetails: [],
			ifsccode: [],
			isdefault: [false],
			createdby: [],
			updatedby: [],
		});

		this.userdata$ = this._authservice.currentUser;
		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this.userdata = data;
			this.submitForm.patchValue({
				center_id: this.userdata.center_id,
				createdby: this.userdata.userid,
				updatedby: this.userdata.userid,
			});
			this.ready = 1;
			this.reloadBankDetails();
			this._cdr.markForCheck();
		});
	}

	ngOnInit() {}

	ngAfterViewInit() {}

	reloadBankDetails() {
		this._commonApiService.getBanks(this.userdata.center_id).subscribe((data: any) => {
			this.bankList = data.result;

			this._cdr.markForCheck();
		});
	}

	handleChange(event) {
		this.submitForm.reset();
		this.isEditBank = true;
		this.submitForm.patchValue({
			id: event.value.id,
			bankname: event.value.bankname,
			accountno: event.value.accountno,
			accountname: event.value.accountname,
			branchdetails: event.value.branch,
			ifsccode: event.value.ifsccode,
			center_id: this.userdata.center_id,
			createdby: this.userdata.userid,
			updatedby: this.userdata.userid,
			isdefault: event.value.isdefault === 'Y' ? true : false,
		});
	}

	addBank() {
		this.isAddBank = true;
		this.submitForm.reset();
		this.submitForm.patchValue({
			center_id: this.userdata.center_id,
			createdby: this.userdata.userid,
		});

		this._cdr.markForCheck();
	}

	onSubmit(mode) {
		if (!this.submitForm.valid) {
			return false;
		}

		if (mode === 'add') {
			this._commonApiService.insertBank(this.submitForm.value).subscribe((data: any) => {
				if (data.body.message === 'success') {
					this.openSnackBar('Added Bank Successfully', '');
					this.reloadBankDetails();
					this.isAddBank = false;
					this._cdr.markForCheck();
				}
			});
		} else if (mode === 'update') {
			// check if atleast one bank has default enabled.

			const list = this.bankList.filter((e) => {
				return e.isdefault === 'Y';
			});

			if ((list.length === 0 || list.length === 1) && this.submitForm.value.isdefault === false) {
				this.openSnackBar('Need Atleast one Bank To Print in Invoice', '');
				return false;
			}

			this._commonApiService.updateBank(this.submitForm.value).subscribe((data: any) => {
				if (data.body.message === 'success') {
					this.openSnackBar('Bank Information Edited Successfully', '');
					this.reloadBankDetails();
					this.isAddBank = false;
					this.isEditBank = false;
					this._cdr.markForCheck();
				}
			});
		}
	}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', 'mat-primary'],
		});
	}

	cancel() {
		this.submitForm.reset();
		this.submitForm.patchValue({
			center_id: this.userdata.center_id,
			createdby: this.userdata.userid,
			updatedby: this.userdata.userid,
		});
		this.isAddBank = false;
		this.isEditBank = false;
	}
}
