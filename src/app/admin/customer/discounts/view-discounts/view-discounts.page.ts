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
import { Brand } from 'src/app/models/Brand';
import { BrandEditDialogComponent } from 'src/app/components/brands/brand-edit-dialog/brand-edit-dialog.component';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';

import { BrandAddDialogComponent } from 'src/app/components/brands/brand-add-dialog/brand-add-dialog.component';
import * as xlsx from 'xlsx';
import { User } from 'src/app/models/User';
import { DefaultDiscountsComponent } from 'src/app/components/customers/discount/default-discounts/default-discounts.component';
import { BrandDiscountsComponent } from 'src/app/components/customers/discount/brand-discounts/brand-discounts.component';
import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';

@Component({
	selector: 'app-view-discounts',
	templateUrl: './view-discounts.page.html',
	styleUrls: ['./view-discounts.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDiscountsPage implements OnInit {
	center_id: any;
	resultList: any;

	pageLength: any;
	isTableHasData = true;

	userdata$: Observable<User>;

	ready = 0; // flag check - centerid (localstorage) & customerid (param)

	@ViewChild('mySearchbar', { static: true }) searchbar: IonSearchbar;

	displayedColumns: string[] = [
		'name',
		'type',
		'effdate',
		'gstzero',
		'gstfive',
		'gsttwelve',
		'gsteighteen',
		'gsttwentyeight',
		'actions',
	];
	dataSource = new MatTableDataSource<Brand>();

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	@ViewChild('epltable', { static: false }) epltable: ElementRef;

	constructor(
		private _authservice: AuthenticationService,
		private _cdr: ChangeDetectorRef,
		private _commonApiService: CommonApiService,
		private _dialog: MatDialog,
		private _route: ActivatedRoute,
		private _router: Router
	) {
		this.userdata$ = this._authservice.currentUser;
		this.userdata$
			.pipe(filter((data) => data !== null))
			.subscribe((data: any) => {
				this.center_id = data.center_id;
				this.ready = 1;
				this.reloadBrands();
				this._cdr.markForCheck();
			});

		this._route.params.subscribe((params) => {
			this.init();
		});
	}

	ngOnInit() {
		this.dataSource.paginator = this.paginator;
	}

	init() {
		if (this.ready === 1) {
			// ready = 1 only after userdata observable returns
			this.reloadBrands();
		}
	}

	reloadBrands() {
		// this._commonApiService.getAllCustomerDefaultDiscounts(this.center_id)
		//   .subscribe((data: any) => {

		//     // DnD - code to add a "key/Value" in every object of array
		//     this.dataSource.data = data.map(el => {
		//       var o = Object.assign({}, el);
		//       o.isExpanded = false;
		//       return o;
		//     })

		//     this.dataSource.sort = this.sort;
		//     this.pageLength = data.length;

		//   });

		this._cdr.markForCheck();
	}

	addBrand() {
		this._router.navigate([`/home/brand/add`]);
	}

	editdefault(element) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '80%';
		dialogConfig.height = '80%';
		dialogConfig.data = element;

		const dialogRef = this._dialog.open(
			DefaultDiscountsComponent,
			dialogConfig
		);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					this.reloadBrands();
					this._cdr.markForCheck();
				})
			)
			.subscribe((data: any) => {
				if (data.body === 1) {
					const dialogConfigSuccess = new MatDialogConfig();
					dialogConfigSuccess.disableClose = false;
					dialogConfigSuccess.autoFocus = true;
					dialogConfigSuccess.width = '25%';
					dialogConfigSuccess.height = '25%';
					dialogConfigSuccess.data = 'Discount updated successfully';

					const dialogRef = this._dialog.open(
						SuccessMessageDialogComponent,
						dialogConfigSuccess
					);
				}
			});
	}

	manageBrandDiscounts(element) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '80%';
		dialogConfig.height = '80%';
		dialogConfig.data = element;

		const dialogRef = this._dialog.open(BrandDiscountsComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					this.reloadBrands();
					this._cdr.markForCheck();
				})
			)
			.subscribe((data: any) => {
				if (data === 'success') {
					const dialogConfigSuccess = new MatDialogConfig();
					dialogConfigSuccess.disableClose = false;
					dialogConfigSuccess.autoFocus = true;
					dialogConfigSuccess.width = '25%';
					dialogConfigSuccess.height = '25%';
					dialogConfigSuccess.data = 'Discounts successfull';

					const dialogRef = this._dialog.open(
						SuccessMessageDialogComponent,
						dialogConfigSuccess
					);
				}
			});
	}

	add() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '50%';
		dialogConfig.height = '50%';

		const dialogRef = this._dialog.open(BrandAddDialogComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					console.log('calling add close..');
					this.reloadBrands();
					this._cdr.markForCheck();
				})
			)
			.subscribe((data: any) => {
				if (data.result === 'success') {
					const dialogConfigSuccess = new MatDialogConfig();
					dialogConfigSuccess.disableClose = false;
					dialogConfigSuccess.autoFocus = true;
					dialogConfigSuccess.width = '25%';
					dialogConfigSuccess.height = '25%';
					dialogConfigSuccess.data = 'Discounts added successfully';

					const dialogRef = this._dialog.open(
						SuccessMessageDialogComponent,
						dialogConfigSuccess
					);
				}
			});
	}

	applyFilter(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.dataSource.filter = filterValue;

		if (this.dataSource.filteredData.length > 0) {
			this.isTableHasData = true;
		} else {
			this.isTableHasData = false;
		}
	}

	reset() {}

	exportToExcel() {
		const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(
			this.epltable.nativeElement
		);

		ws['!cols'] = [];
		ws['!cols'][7] = { hidden: true };

		const wb: xlsx.WorkBook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
		xlsx.writeFile(wb, 'epltable.xlsx');
	}
}
