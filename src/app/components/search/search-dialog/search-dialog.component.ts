import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { InventoryReportsDialogComponent } from '../../reports/inventory-reports-dialog/inventory-reports-dialog.component';

@Component({
	selector: 'app-search-dialog',
	templateUrl: './search-dialog.component.html',
	styleUrls: ['./search-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchDialogComponent implements OnInit {
	resultList: any;
	noMatch: any;

	customer_id;
	center_id;
	order_date;

	searchByFlag;
	placeHolderTxt;

	searchBy = [{ searchby: 'Item' }, { searchby: 'Customer' }, { searchby: 'Vendor' }, { searchby: 'Brand' }];

	@ViewChild('mySearchbar', { static: true }) searchbar: IonSearchbar;

	constructor(private _commonApiService: CommonApiService, private _modalcontroller: ModalController, private _cdr: ChangeDetectorRef) {
		this.searchByFlag = 'Item';
		this.placeHolderTxt = 'Search By Part Number or Description';
	}

	ngOnInit() {}

	ionViewDidEnter() {
		setTimeout(() => {
			this.searchbar.setFocus();
		}, 400);
	}

	openDialog(searchstring): void {
		this.resultList = [];

		if (this.searchByFlag === 'Item') {
			this._commonApiService
				.getProductInfo({ centerid: this.center_id, searchstring: searchstring, searchby: this.searchByFlag })
				.subscribe((data) => {
					this.resultList = data.body;

					if (this.resultList.length === 0) {
						this.noMatch = 'No Matching Records';
						this._cdr.markForCheck();
					} else if (this.resultList.length > 0) {
						this.noMatch = '';
						this._cdr.markForCheck();
					}
				});
		} else if (this.searchByFlag === 'Customer') {
			this._commonApiService.getCustomerInfo({ centerid: this.center_id, searchstr: searchstring }).subscribe((data) => {
				this.resultList = data.body;

				if (this.resultList.length === 0) {
					this.noMatch = 'No Matching Records';
					this._cdr.markForCheck();
				} else if (this.resultList.length > 0) {
					this.noMatch = '';

					this._cdr.markForCheck();
				}
			});
		} else if (this.searchByFlag === 'Vendor') {
			this._commonApiService.getVendorInfo({ centerid: this.center_id, searchstr: searchstring }).subscribe((data) => {
				this.resultList = data.body;

				if (this.resultList.length === 0) {
					this.noMatch = 'No Matching Records';
					this._cdr.markForCheck();
				} else if (this.resultList.length > 0) {
					this.noMatch = '';

					this._cdr.markForCheck();
				}
			});
		} else if (this.searchByFlag === 'Brand') {
			this._commonApiService.getBrandInfo({ centerid: this.center_id, searchstr: searchstring }).subscribe((data) => {
				this.resultList = data.body;

				if (this.resultList.length === 0) {
					this.noMatch = 'No Matching Records';
					this._cdr.markForCheck();
				} else if (this.resultList.length > 0) {
					this.noMatch = '';

					this._cdr.markForCheck();
				}
			});
		}
	}

	reset() {
		this.searchbar.value = '';
		this.noMatch = '';
		this.resultList = null;
	}

	handleSearchBy(event) {
		this.searchByFlag = event.value;

		if (event.value === 'Item') {
			this.placeHolderTxt = 'Search By Part Number or Description';
		} else if (event.value === 'Customer') {
			this.placeHolderTxt = 'Search By Customer Name';
		}
		this.reset();
		this.searchbar.setFocus();
	}

	closeModal() {
		this._modalcontroller.dismiss();
	}

	async showInventoryReportsDialog(product_code, product_id) {
		const modal = await this._modalcontroller.create({
			component: InventoryReportsDialogComponent,
			componentProps: { center_id: this.center_id, product_code: product_code, product_id: product_id },
			cssClass: 'select-modal',
		});

		modal.onDidDismiss().then((result) => {
			this._cdr.markForCheck();
		});

		await modal.present();
	}
}
