import { Component, OnInit, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from '../../../services/common-api.service';
import { Validators, FormBuilder, AbstractControl, FormGroup, FormControl } from '@angular/forms';
import { patternValidator } from 'src/app/util/validators/pattern-validator';
import { EMAIL_REGEX, GSTN_REGEX, country, PINCODE_REGEX } from 'src/app/util/helper/patterns';
import { PhoneValidator } from 'src/app/util/validators/phone.validator';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User';
import { filter } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-edit-center',
	templateUrl: './edit-center.page.html',
	styleUrls: ['./edit-center.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCenterPage implements OnInit {
	restApiUrl = environment.restApiUrl;
	durationInSeconds = 2;
	center_id: any;
	customer_id: any;
	resultList: any;
	selectedFile = 'Choose a File...';
	submitForm: FormGroup;

	filesizeAlert: any;

	statesdata: any;
	isLinear = true;

	userdata$: Observable<User>;
	ready = 0;
	fileName = '';
	now = new Date().getMilliseconds();

	imageError = '';
	sideImageError = '';

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _formBuilder: FormBuilder,
		private _snackBar: MatSnackBar,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		private _commonApiService: CommonApiService
	) {
		this.userdata$ = this._authservice.currentUser;
		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this.center_id = data.center_id;
			this.ready = 1;
			this.reloadCenterDetails();
			this._cdr.markForCheck();
		});

		this.submitForm = this._formBuilder.group({
			formArray: this._formBuilder.array([
				this._formBuilder.group({
					center_id: [''],
					company_id: [''],
					name: ['', Validators.required],
					address1: [''],
					address2: [''],
					address3: [''],

					district: [''],
					state_id: ['', Validators.required],
					pin: ['', [patternValidator(PINCODE_REGEX)]],
				}),
				this._formBuilder.group({
					gst: ['', [patternValidator(GSTN_REGEX)]],
					phone: ['', Validators.compose([PhoneValidator.invalidCountryPhone(country)])],
					mobile: ['', Validators.compose([PhoneValidator.invalidCountryPhone(country)])],
					mobile2: ['', Validators.compose([PhoneValidator.invalidCountryPhone(country)])],
					whatsapp: ['', Validators.compose([PhoneValidator.invalidCountryPhone(country)])],
				}),

				this._formBuilder.group({
					email: ['', [patternValidator(EMAIL_REGEX)]],
					bankname: [''],
					accountno: [''],
					ifsccode: [''],
					branch: [''],
				}),
			]),
		});

		this._commonApiService.getStates().subscribe((data: any) => {
			this.statesdata = data;
		});
	}

	ngOnInit() {}

	reloadCenterDetails() {
		this.resultList = [];
		this._commonApiService.getCenterDetails(this.center_id).subscribe((data: any) => {
			this.resultList = data[0];
			this.now = new Date().getMilliseconds();

			this.setFormValues();

			this._cdr.markForCheck();
			this._cdr.detectChanges();
		});
	}

	setFormValues() {
		this.submitForm.get('formArray').get([0]).patchValue({ center_id: this.center_id });
		this.submitForm.get('formArray').get([0]).patchValue({ company_id: this.resultList.company_id });
		this.submitForm.get('formArray').get([0]).patchValue({ name: this.resultList.name });
		this.submitForm.get('formArray').get([0]).patchValue({ address1: this.resultList.address1 });
		this.submitForm.get('formArray').get([0]).patchValue({ address2: this.resultList.address2 });
		this.submitForm.get('formArray').get([0]).patchValue({ address3: this.resultList.address3 });
		this.submitForm.get('formArray').get([0]).patchValue({ district: this.resultList.district });
		this.submitForm.get('formArray').get([0]).patchValue({ state_id: this.resultList.state_id });
		this.submitForm.get('formArray').get([0]).patchValue({ pin: this.resultList.pin });

		this.submitForm.get('formArray').get([1]).patchValue({ gst: this.resultList.gst });
		this.submitForm.get('formArray').get([1]).patchValue({ phone: this.resultList.phone });
		this.submitForm.get('formArray').get([1]).patchValue({ mobile: this.resultList.mobile });
		this.submitForm.get('formArray').get([1]).patchValue({ mobile2: this.resultList.mobile2 });
		this.submitForm.get('formArray').get([1]).patchValue({ whatsapp: this.resultList.whatsapp });

		this.submitForm.get('formArray').get([2]).patchValue({ email: this.resultList.email });

		this.submitForm.get('formArray').get([2]).patchValue({ bankname: this.resultList.bankname });
		this.submitForm.get('formArray').get([2]).patchValue({ accountno: this.resultList.accountno });
		this.submitForm.get('formArray').get([2]).patchValue({ ifsccode: this.resultList.ifsccode });
		this.submitForm.get('formArray').get([2]).patchValue({ branch: this.resultList.branch });
	}

	/** Returns a FormArray with the name 'formArray'. */
	get formArray(): AbstractControl | null {
		return this.submitForm.get('formArray');
	}

	submit() {
		this._commonApiService.updateCenter(this.submitForm.value).subscribe((data: any) => {
			this.updateSnackBar();
		});
	}

	searchCustomers() {
		this._router.navigate([`/home/view-centers`]);
	}

	addCenter() {
		this._router.navigate([`/home/center/add`]);
	}

	updateSnackBar() {
		this._snackBar.openFromComponent(UpdateSnackBarComponent, {
			duration: this.durationInSeconds * 1000,
		});
	}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', 'mat-primary'],
		});
	}

	onFileSelected(event, position) {
		const file: File = event.target.files[0];
		this.imageError = '';
		this.sideImageError = '';

		if (file) {
			this.fileName = file.name;
			// Size Filter Bytes
			const max_size = 20971520;
			const allowed_types = ['image/png', 'image/jpeg'];
			const max_height = 15200;
			const max_width = 25600;

			if (event.target.files[0].size > max_size) {
				this.imageError = 'Maximum size allowed is ' + max_size / 1000 + 'Mb';

				return false;
			}

			const URL = window.URL || window.webkitURL;
			const Img = new Image();

			const filesToUpload = event.target.files;
			Img.src = URL.createObjectURL(filesToUpload[0]);

			Img.onload = (e: any) => {
				const height = e.path[0].height;
				const width = e.path[0].width;

				console.log(height, width);

				if (position === 'side') {
					if (width > 380 || height > 101) {
						this.sideImageError = 'Upload after Resizing Logo to 380px X 100px';
						this.imageError = '';
						this._cdr.detectChanges();
						return false;
					} else {
						this.uploadImage(file, position);
					}
				} else if (position === 'main') {
					if (width > 110 || height > 110) {
						this.imageError = 'Upload after Resizing Logo to 110px X 110px';
						this.sideImageError = '';
						this._cdr.detectChanges();
						return false;
					} else {
						this.uploadImage(file, position);
					}
				}
			};
		}
	}

	uploadImage(file, position) {
		const formData = new FormData();

		formData.append('thumbnail', file);

		this._commonApiService.uploadCompanyLogo(formData, this.center_id, position).subscribe((data: any) => {
			console.log('dinesh ' + data);
			let response = data;

			if (response.result === 'ok') {
				// throw snackbar & display image
				if (position === 'side') {
					this.openSnackBar('Side Logo Uploaded Successfully', '');
				} else {
					this.openSnackBar('Logo Uploaded Successfully', '');
				}
				this.reloadCenterDetails();
			}
		});
	}
}

@Component({
	selector: 'update-snack-bar',
	template: `<span class="snackbar"> Center details update successful !!! </span>`,
	styles: [
		`
			.snackbar {
				color: #ffffff;
			}
		`,
	],
})
export class UpdateSnackBarComponent {}
