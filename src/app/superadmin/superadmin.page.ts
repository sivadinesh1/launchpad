import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { CountryPhone } from '../util/validators/country-phone.model';
import { PhoneValidator } from '../util/validators/phone.validator';
import { AuthenticationService } from '../services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import { DeviceDetectorService } from 'ngx-device-detector';
//import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { lastValueFrom } from 'rxjs';
@Component({
	selector: 'app-superadmin',
	templateUrl: './superadmin.page.html',
	styleUrls: ['./superadmin.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperadminPage implements OnInit {
	loginForm: FormGroup;
	invalidLogin = false;
	deviceInfo = null;

	countries: Array<CountryPhone>;

	responsemsg: any;
	apiresponse: any;

	ipAddress: any;

	hide = true;

	validation_messages = {
		phone: [
			{ type: 'required', message: 'Phone Number is required.' },
			{ type: 'pattern', message: 'Enter a valid Phone Number.' },
			{ type: 'invalidCountryPhone', message: 'Mobile Number seems wrong.' },
		],
		password: [
			{ type: 'required', message: 'Password is required.' },
			{
				type: 'minlength',
				message: 'Password must be at least 5 characters long.',
			},
		],
	};

	companies: any = [
		{
			full: 'The Tirumurugan Tractors Parts',
			short: '2',
		},
		{
			full: 'Sri Tirumurugan Tractors Parts',
			short: '1',
		},
		{
			full: 'Sri Pathy',
			short: '3',
		},
		{
			full: 'Agni - Erode',
			short: '4',
		},
	];
	selectedCompany: string = '1';

	constructor(
		public router: Router,
		private _cdr: ChangeDetectorRef,
		private _commonApiService: CommonApiService,
		private authenticationService: AuthenticationService,
		private deviceService: DeviceDetectorService,
	) {
		// displays sample phone # in UI, placeholder="{{ this.countries[0].sample_phone }}"
		this.countries = [new CountryPhone('IN', 'India'), new CountryPhone('US', 'United States')];

		const country = new FormControl(this.countries[0], Validators.required);

		this.loginForm = new FormGroup({
			phone: new FormControl('9999999990', Validators.compose([Validators.required, PhoneValidator.invalidCountryPhone(country)])),

			password: new FormControl('tts1234', Validators.compose([Validators.minLength(5), Validators.required])),
		});
	}

	ngOnInit(): void {
		this.epicFunction();
	}

	epicFunction() {
		console.log('hello `Home` component');
		this.deviceInfo = this.deviceService.getDeviceInfo();
		const isMobile = this.deviceService.isMobile();
		const isTablet = this.deviceService.isTablet();
		const isDesktopDevice = this.deviceService.isDesktop();
		console.log(this.deviceInfo);
		console.log(isMobile); // returns if the device is a mobile device (android / iPhone / windows-phone etc)
		console.log(isTablet); // returns if the device us a tablet (iPad etc)
		console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.
	}

	doFacebookLogin(): void {
		console.log('facebook login');
		this.router.navigate(['auth/fb-login']);
	}

	doGoogleLogin(): void {
		console.log('google login');
		this.router.navigate(['auth/gp-login']);
	}

	async doLogin(): Promise<void> {
		let username = '9999999990';
		let password = 'tts1234';

		let predata = await lastValueFrom(this.authenticationService.superadmin(this.selectedCompany));
		debugger;
		let data = await lastValueFrom(this.authenticationService.login(username, password));

		if (data.result === 'success') {
			let role = data.role;
			this.responsemsg = '';

			this.authenticationService.fetchPermissions(data.obj.center_id, data.obj.role_id);

			if (role === 'ADMIN') {
				this.router.navigate([`/home/admin-dashboard`]);
				this.authenticationService.setCurrentMenu('HOME');
				this.invalidLogin = false;
			} else {
				this.router.navigate([`/home/dashboard`]);
				this.authenticationService.setCurrentMenu('HOME');
				this.invalidLogin = false;
			}
			this._cdr.detectChanges();
		} else if (data.result === 'error') {
			this.invalidLogin = true;
			if (data.statusCode === '601') {
				this.responsemsg = 'User not Found.';
			} else if (data.statusCode === '600') {
				this.responsemsg = 'Login Failed. Invalid Credentials';
			} else if (data.statusCode === '100') {
				this.responsemsg = 'Login Failed. Database Connection Error';
			}
			this._cdr.detectChanges();
		}
	}

	ngOnDestroy() {}
}
