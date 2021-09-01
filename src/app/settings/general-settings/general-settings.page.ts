import {
	Component,
	OnInit,
	ChangeDetectorRef,
	ViewChild,
	ChangeDetectionStrategy,
} from '@angular/core';
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
	selector: 'app-general-settings',
	templateUrl: './general-settings.page.html',
	styleUrls: ['./general-settings.page.scss'],
})
export class GeneralSettingsPage implements OnInit {
	timezonesdata: any;
	submitForm: any;
	userdata$: Observable<User>;
	userdata: any;
	selectedTimezoneId = '1';

	ready = 0;
	resultList: any;

	constructor(
		private _cdr: ChangeDetectorRef,
		private _router: Router,
		private _fb: FormBuilder,
		private _snackBar: MatSnackBar,
		private _route: ActivatedRoute,
		private _authservice: AuthenticationService,
		private _commonApiService: CommonApiService
	) {
		this._commonApiService.getTimezones().subscribe((data: any) => {
			this.timezonesdata = data;
		});

		this.userdata$ = this._authservice.currentUser;
		this.userdata$
			.pipe(filter((data) => data !== null))
			.subscribe((data: any) => {
				this.userdata = data;
				this.ready = 1;
				this.reloadCenterDetails();
				this._cdr.markForCheck();
			});

		this.submitForm = this._fb.group({
			center_id: [''],
			timezoneid: [Validators.required],
		});
	}

	ngOnInit() {}

	ngAfterViewInit() {}

	reloadCenterDetails() {
		this._commonApiService
			.getCenterDetails(this.userdata.center_id)
			.subscribe((data: any) => {
				this.resultList = data[0];

				this.submitForm.patchValue({ center_id: this.userdata.center_id });
				this.submitForm.patchValue({ timezoneid: this.resultList.timezone_id });

				this._cdr.markForCheck();
			});
	}
}
