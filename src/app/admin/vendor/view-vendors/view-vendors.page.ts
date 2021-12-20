import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ViewChild,
    ChangeDetectionStrategy,
    ElementRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonApiService } from 'src/app/services/common-api.service';
import { IonSearchbar } from '@ionic/angular';

import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { filter, tap, catchError } from 'rxjs/operators';
import { Vendor } from 'src/app/models/Vendor';
import { VendorEditDialogComponent } from 'src/app/components/vendors/vendor-edit-dialog/vendor-edit-dialog.component';

import { LoadingService } from 'src/app/components/loading/loading.service';
import { MessagesService } from '../../../components/messages/messages.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { User } from '../../../models/User';
import { VendorAddDialogComponent } from 'src/app/components/vendors/vendor-add-dialog/vendor-add-dialog.component';
import * as xlsx from 'xlsx';
import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { DeleteVendorDialogComponent } from 'src/app/components/delete-vendor-dialog/delete-vendor-dialog.component';

@Component({
    selector: 'app-view-vendors',
    templateUrl: './view-vendors.page.html',
    styleUrls: ['./view-vendors.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewVendorsPage implements OnInit {
    @ViewChild('mySearchbar', { static: true }) searchbar: IonSearchbar;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    center_id: any;
    resultList: any;

    pageLength: any;
    isTableHasData = true;

    user_data$: Observable<User>;

    ready = 0; // flag check - center_id (local storage) & customer id (param)

    displayedColumns: string[] = [
        'name',
        'address1',
        'credit',
        'outstanding',
        'lastpaiddate',
    ];
    dataSource = new MatTableDataSource<Vendor>();

    resultArray: any = [];

    constructor(
        private _authService: AuthenticationService,
        private _cdr: ChangeDetectorRef,
        private _commonApiService: CommonApiService,
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private _route: ActivatedRoute,
        private _router: Router
    ) {
        this.user_data$ = this._authService.currentUser;
        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.center_id = data.center_id;
                this.ready = 1;
                this.reloadVendors();
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
            // ready = 1 only after user_data observable returns
            this.reloadVendors();
        }
    }

    reloadVendors() {
        this._commonApiService.getAllActiveVendors().subscribe((data: any) => {
            this.resultArray = data;
            this._cdr.markForCheck();
        });
    }

    addVendor() {
        this._router.navigate([`/home/vendor/add`]);
    }

    edit(vendor: Vendor) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '500px';
        dialogConfig.height = '100%';
        dialogConfig.data = vendor;
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            VendorEditDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    this.reloadVendors();
                    this._cdr.markForCheck();
                })
            )
            .subscribe();
    }

    add() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '500px';
        dialogConfig.height = '100%';
        dialogConfig.position = { top: '0', right: '0' };
        dialogConfig.panelClass = 'app-full-bleed-dialog';

        const dialogRef = this._dialog.open(
            VendorAddDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    this.reloadVendors();
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    this.openSnackBar('Vendor added successfully', '');
                }
            });
    }

    applyFilter(filterValue: any) {
        filterValue = filterValue.target.value.trim(); // Remove whitespace
        filterValue = filterValue.target.value.toLowerCase(); // Data source defaults to lowercase matches

        this.resultArray = filterValue;

        if (this.dataSource.filteredData.length > 0) {
            this.isTableHasData = true;
        } else {
            this.isTableHasData = false;
        }
    }

    delete(vendor: Vendor) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '40%';
        dialogConfig.height = '40%';
        dialogConfig.data = vendor;

        const dialogRef = this._dialog.open(
            DeleteVendorDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    this.reloadVendors();
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    this.openSnackBar('Vendor deleted successfully', '');

                    this.reloadVendors();
                }
            });
    }

    reset() {}

    goVendorFinancials(item) {
        this._router.navigate([
            `/home/financials-vendor/${this.center_id}/${item.id}`,
        ]);
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 2000,
            panelClass: ['mat-toolbar', 'mat-primary'],
        });
    }

    exportVendorDataToExcel() {
        // const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(
        //     this.epltable.nativeElement
        // );
        // ws['!cols'] = [];
        // ws['!cols'][2] = { hidden: true };
        // const wb: xlsx.WorkBook = xlsx.utils.book_new();
        // xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
        // xlsx.writeFile(wb, 'vendor_list.xlsx');
    }
}
