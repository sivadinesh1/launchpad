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
import { User } from '../../../models/User';
import { BrandAddDialogComponent } from 'src/app/components/brands/brand-add-dialog/brand-add-dialog.component';
import * as xlsx from 'xlsx';
import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { DeleteBrandDialogComponent } from '../../../components/delete-brand-dialog/delete-brand-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HelperUtilsService } from 'src/app/services/helper-utils.service';

@Component({
    selector: 'app-view-brands',
    templateUrl: './view-brands.page.html',
    styleUrls: ['./view-brands.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewBrandsPage implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    @ViewChild('mySearchbar', { static: true }) searchbar: IonSearchbar;

    displayedColumns: string[] = ['name', 'edit', 'delete'];
    dataSource = new MatTableDataSource<Brand>();

    center_id: any;
    resultList: any;

    pageLength: any;
    isTableHasData = true;

    user_data$: Observable<User>;

    listArray = [];
    tempListArray = [];

    full_count = 0;
    offset = 0;
    length = 50;
    is_loaded = false;

    all_caught_up = '';

    constructor(
        private _authService: AuthenticationService,
        private _cdr: ChangeDetectorRef,
        private _commonApiService: CommonApiService,
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private _route: ActivatedRoute,
        private _router: Router,
        public _helperUtilsService: HelperUtilsService
    ) {
        this.user_data$ = this._authService.currentUser;
        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.center_id = data.center_id;

                this._cdr.markForCheck();
            });

        this._route.params.subscribe((params) => {
            this.offset = 0;
            this.all_caught_up = '';
            this.reloadBrands('');
            this.init();
        });
    }

    ngOnInit() {
        this.dataSource.paginator = this.paginator;
    }

    init() {
        this.is_loaded = false;
        this.reloadBrands('');
    }

    reloadBrands(event) {
        this._commonApiService
            .getAllActiveBrandsPost({
                offset: this.offset,
                length: this.length,
            })
            .subscribe((data: any) => {
                this.is_loaded = true;
                if (event === '') {
                    this.full_count = data.body.full_count;
                    this.tempListArray = data.body.result;
                    this.listArray = data.body.result;
                    this._cdr.detectChanges();
                } else {
                    this.full_count = data.body.full_count;
                    this.listArray = this.tempListArray.concat(
                        data.body.result
                    );
                    this.tempListArray = this.listArray;

                    event.target.complete();
                    this._cdr.detectChanges();
                }
            });
    }

    addBrand() {
        this._router.navigate([`/home/brand/add`]);
    }

    delete(brand: Brand) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '40%';
        dialogConfig.height = '40%';
        dialogConfig.data = brand;

        const dialogRef = this._dialog.open(
            DeleteBrandDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    this.is_loaded = false;
                    this.reloadBrands('');
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    this.openSnackBar('Brand deleted successfully', '');
                    this.is_loaded = false;
                    this.reloadBrands('');
                }
            });
    }

    edit(brand: Brand) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '40%';
        dialogConfig.height = '40%';
        dialogConfig.data = brand;

        const dialogRef = this._dialog.open(
            BrandEditDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    this.is_loaded = false;
                    this.reloadBrands('');
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    this.openSnackBar('Brand updated successfully', '');
                }
            });
    }

    add() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '50%';
        dialogConfig.height = '50%';

        const dialogRef = this._dialog.open(
            BrandAddDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    console.log('calling add close..');
                    this.is_loaded = false;
                    this.reloadBrands('');
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    this.openSnackBar('Brand added successfully', '');
                }
            });
    }

    applyFilter(filterValue: any) {
        filterValue = filterValue.target.value.trim(); // Remove whitespace
        filterValue = filterValue.target.value.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;

        if (this.dataSource.filteredData.length > 0) {
            this.isTableHasData = true;
        } else {
            this.isTableHasData = false;
        }
    }

    reset() {}

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 2000,
            panelClass: ['mat-toolbar', 'mat-primary'],
        });
    }

    exportToExcel() {
        // const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(
        //     this.epltable.nativeElement
        // );
        // ws['!cols'] = [];
        // ws['!cols'][1] = { hidden: true };
        // const wb: xlsx.WorkBook = xlsx.utils.book_new();
        // xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
        // xlsx.writeFile(wb, 'epltable.xlsx');
    }

    doInfinite(ev: any) {
        console.log('scrolled down!!', ev);

        this.offset += 50;

        if (this.full_count > this.listArray.length) {
            this.is_loaded = false;
            this.reloadBrands(ev);
        } else {
            this.all_caught_up = 'You have reached the end of the list';
            ev.target.complete();
            this._cdr.detectChanges();
        }
    }
}
