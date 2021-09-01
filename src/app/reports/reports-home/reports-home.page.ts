import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-reports-home',
	templateUrl: './reports-home.page.html',
	styleUrls: ['./reports-home.page.scss'],
})
export class ReportsHomePage implements OnInit {
	constructor(private _router: Router) {}

	ngOnInit() {}

	getItemWiseReports() {
		this._router.navigate([`/home/reports/item-wise-sale-reports`]);
	}

	viewInventoryReports() {
		this._router.navigate(['home/reports/inventory-reports']);
	}

	viewProductSummaryReports() {
		this._router.navigate(['home/reports/product-summary-reports']);
	}

	openBackOrder() {
		this._router.navigateByUrl('/home/enquiry/back-order');
	}
}
