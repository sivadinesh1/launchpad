import {
	Component,
	OnInit,
	Input,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
} from '@angular/core';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../models/User';
import { filter, map, defaultIfEmpty } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';

import { SearchDialogComponent } from '../search/search-dialog/search-dialog.component';
import { SettingsDialogComponent } from '../settings/settings-dialog/settings-dialog.component';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
	userdata: any;
	center_id: any;

	userdata$: Observable<User>;

	public today = Date.now();

	constructor(
		private _authservice: AuthenticationService,
		private _modalcontroller: ModalController,
		private _cdr: ChangeDetectorRef,
		private _router: Router
	) {
		this.userdata$ = this._authservice.currentUser;

		this.userdata$
			.pipe(filter((data) => data !== null))
			.subscribe((data: any) => {
				this.userdata = data;
				this._cdr.markForCheck();
			});
	}

	ngOnInit() {}

	goAdmin() {
		this._router.navigate([`/home/admin`]);
	}

	async logout() {
		await this._authservice.logOut();
		this._router.navigateByUrl('');
	}

	viewProduct() {
		this._router.navigate([`/home/view-products`]);
	}

	viewVendor() {
		this._router.navigate([`/home/view-vendors`]);
	}

	viewBrand() {
		this._router.navigate([`/home/view-brands`]);
	}

	viewCustomer() {
		this._router.navigate([`/home/view-customers`]);
	}

	editCenter() {
		this._router.navigate([`/home/center/edit`, this.userdata.center_id]);
	}

	showNewEnquiry() {
		this._router.navigate([`/home/enquiry`]);
	}

	showCustomerStatement() {
		this._router.navigate([`/home/statement-reports`]);
	}

	showNewSales() {
		this._router.navigate([`home/sales/edit/0/TI`]);
	}

	viewDiscounts() {
		this._router.navigate(['/home/view-discounts']);
	}

	viewInventoryReports() {
		this._router.navigate(['home/reports/inventory-reports']);
	}

	viewProductSummaryReports() {
		this._router.navigate(['home/reports/product-summary-reports']);
	}

	viewUsers() {
		this._router.navigate(['home/users-list']);
	}

	goCustomers() {}

	async showAddProductComp() {
		const modal = await this._modalcontroller.create({
			component: SearchDialogComponent,
			componentProps: { center_id: this.userdata?.center_id, customer_id: 0 },
			cssClass: 'select-modal',
		});

		modal.onDidDismiss().then((result) => {
			console.log('The result:', result);
			this._cdr.markForCheck();
		});

		await modal.present();
	}

	openBackOrder() {
		this._router.navigateByUrl('/home/enquiry/back-order');
	}

	goAccountsScreen() {
		this._router.navigateByUrl(`/home/accounts/accounts-dash`);
	}

	async openSettings() {
		const modal = await this._modalcontroller.create({
			component: SettingsDialogComponent,
			componentProps: {
				center_id: this.userdata.center_id,
				role_id: this.userdata.role_id,
			},
			cssClass: 'select-modal',
		});

		modal.onDidDismiss().then((result) => {
			console.log('The result:', result);
			this._cdr.markForCheck();
		});

		await modal.present();
	}
}
