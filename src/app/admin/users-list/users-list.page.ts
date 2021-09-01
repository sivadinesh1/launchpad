import {
	Component,
	OnInit,
	ChangeDetectorRef,
	ViewChild,
	ChangeDetectionStrategy,
	ElementRef,
} from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonApiService } from 'src/app/services/common-api.service';
import { IonSearchbar } from '@ionic/angular';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { filter, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../../models/User';
import { AddUserComponent } from '../../components/users/add-user/add-user.component';
import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import {
	FormGroup,
	FormControl,
	Validators,
	FormBuilder,
} from '@angular/forms';

@Component({
	selector: 'app-users-list',
	templateUrl: './users-list.page.html',
	styleUrls: ['./users-list.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListPage implements OnInit {
	listArr: any;

	pageLength: any;
	isTableHasData = true;
	submitForm: FormGroup;

	userdata$: Observable<User>;
	userdata: any;

	ready = 0; // flag check - centerid (localstorage) & customerid (param)

	@ViewChild('mySearchbar', { static: true }) searchbar: IonSearchbar;

	@ViewChild('epltable', { static: false }) epltable: ElementRef;

	status = [
		{ id: 'A', value: 'Active' },
		{ id: 'D', value: 'Deactive' },
	];

	constructor(
		private _authservice: AuthenticationService,
		private _cdr: ChangeDetectorRef,
		private _commonApiService: CommonApiService,
		private _dialog: MatDialog,
		private _route: ActivatedRoute,
		private _fb: FormBuilder,
		private _router: Router
	) {
		this.userdata$ = this._authservice.currentUser;
		this.userdata$
			.pipe(filter((data) => data !== null))
			.subscribe((data: any) => {
				this.userdata = data;

				this.ready = 1;
				this.reloadUsers('A');
				this._cdr.markForCheck();
			});

		this._route.params.subscribe((params) => {
			this.init();
		});
	}

	ngOnInit() {
		this.submitForm = this._fb.group({
			status: new FormControl('A'),
		});
	}

	init() {
		if (this.ready === 1) {
			// ready = 1 only after userdata observable returns
			this.reloadUsers('A');
		}
	}

	reloadUsers(status) {
		this._commonApiService
			.getUsers(this.userdata.center_id, status)
			.subscribe((data: any) => {
				this.listArr = data;
				this._cdr.markForCheck();
			});
	}

	addBrand() {
		this._router.navigate([`/home/brand/add`]);
	}

	reset() {}

	add() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;

		dialogConfig.width = '500px';
		dialogConfig.height = '100%';
		dialogConfig.position = { top: '0', right: '0' };
		dialogConfig.panelClass = 'app-full-bleed-dialog';

		const dialogRef = this._dialog.open(AddUserComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					console.log('calling add close..');
					this.reloadUsers('A');
					this._cdr.markForCheck();
				})
			)
			.subscribe((data: any) => {
				if (data === 'success') {
					this.init();
				}
			});
	}

	statusChange($event) {
		this.reloadUsers($event.value);
	}

	changestatus(item) {
		if (item.status === 'A') {
			item.status = 'D';
		} else if (item.status === 'D') {
			item.status = 'A';
		}

		this._commonApiService.updateUserStatus(item).subscribe((data: any) => {
			this.reloadUsers('A');

			this._cdr.markForCheck();
		});
	}
}
