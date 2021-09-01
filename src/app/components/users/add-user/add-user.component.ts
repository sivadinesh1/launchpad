import {
	Component,
	OnInit,
	ChangeDetectorRef,
	ViewChild,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from '../../../services/common-api.service';
import { Validators, FormBuilder, FormControl } from '@angular/forms';

import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { User } from 'src/app/models/User';
import { country } from 'src/app/util/helper/patterns';
import { PhoneValidator } from 'src/app/util/validators/phone.validator';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'app-add-user',
	templateUrl: './add-user.component.html',
	styleUrls: ['./add-user.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserComponent implements OnInit {
	center_id: any;
	submitForm: any;
	errmsg: any;

	userdata$: Observable<User>;
	userdata: any;

	genderList = [
		{ id: 'M', value: 'Male' },
		{ id: 'F', value: 'Female' },
	];

	roleList = [
		{ id: '1', value: 'Admin' },
		{ id: '2', value: 'Employee' },
		{ id: '3', value: 'Manager' },
	];

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _formBuilder: FormBuilder,
		private dialogRef: MatDialogRef<AddUserComponent>,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		private _snackBar: MatSnackBar,
		private _commonApiService: CommonApiService
	) {
		this._createForm();

		this.userdata$ = this._authservice.currentUser;
		this.userdata$
			.pipe(filter((data) => data !== null))
			.subscribe((data: any) => {
				this.userdata = data;

				this.submitForm.patchValue({
					center_id: data.center_id,
				});

				this._cdr.markForCheck();
			});

		if (this.userdata !== undefined) {
			this.submitForm.patchValue({
				center_id: this.userdata.center_id,
			});
		}
	}

	private _createForm(): void {
		this.submitForm = this._formBuilder.group({
			center_id: [],
			firstname: new FormControl('', Validators.required),

			username: new FormControl(
				'',
				Validators.compose([
					Validators.required,
					PhoneValidator.invalidCountryPhone(country),
				])
			),

			password: new FormControl(
				'',
				Validators.compose([Validators.minLength(6), Validators.required])
			),
			email: new FormControl(''),
			gender: new FormControl('M'),
			role_id: new FormControl('2'),
		});
	}

	ngOnInit() {
		// this.submitForm = this._formBuilder.group({
		//   gender: new FormControl('M'),
		// })
	}

	onSubmit() {
		this.errmsg = '';
		if (!this.submitForm.valid) {
			return false;
		}

		this._commonApiService
			.isUsernameExists(this.submitForm.value.phone, this.userdata.center_id)
			.subscribe((data: any) => {
				if (data.message === 'ALREADY_EXIST') {
					this.errmsg = 'User already exists!';
				} else {
					this._commonApiService
						.addUser(this.submitForm.value)
						.subscribe((data: any) => {
							if (data.body.message === 'User Inserted') {
								this.openSnackBar('User successfully added', '');
								this.dialogRef.close('success');
							} else if (data.body.message === 'DUP_USERNAME') {
								this.openSnackBar(
									'User Mobile # active in another Company',
									''
								);
							}
						});
				}

				this._cdr.markForCheck();
			});
	}

	searchBrands() {
		this._router.navigate([`/home/view-brands`]);
	}

	addBrand() {
		this._router.navigate([`/home/brand/add`]);
	}

	reset() {}

	close() {
		this.dialogRef.close();
	}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', 'mat-primary'],
		});
	}
}
