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
import { HelperUtilsService } from 'src/app/services/helper-utils.service';

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

    displayedColumns: string[] = [
        'name',
        'address1',
        'credit',
        'outstanding',
        'lastpaiddate',
    ];
    dataSource = new MatTableDataSource<Vendor>();

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
                this.is_loaded = false;
                this.offset = 0;
                this.all_caught_up = '';
                this.reloadVendors('');
                this._cdr.markForCheck();
            });

        this._route.params.subscribe((params) => {
            this.offset = 0;
            this.init();
        });
    }

    ngOnInit() {
        this.dataSource.paginator = this.paginator;
    }

    init() {
        this.offset = 0;
        this.is_loaded = false;
        this.reloadVendors('');
    }

    reloadVendors(event) {
        this._commonApiService
            .getAllActiveVendorsPost({
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
                    this.is_loaded = false;
                    this.reloadVendors('');
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
                    this.is_loaded = false;
                    this.reloadVendors('');
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

        this.listArray = filterValue;

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
                    this.reloadVendors('');
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    this.openSnackBar('Vendor deleted successfully', '');

                    this.reloadVendors('');
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

    async exportVendorDataToExcel() {
        const fileName = 'vendor_list.xlsx';

        const reportData = this.listArray;

        reportData.forEach((e) => {
            e['Vendor Name'] = e.vendor_name;
            delete e.vendor_name;

            e['Address 1'] = e.address1;
            delete e.address1;

            e['Address 2'] = e.address2;
            delete e.address2;

            e['Address 3'] = e.address3;
            delete e.address3;

            e.District = e.district;
            delete e.district;

            e.Pin = e.pin;
            delete e.pin;

            e.State = e.state;
            delete e.state;

            e.Mobile = e.mobile;
            delete e.mobile;

            delete e.balance_amt;
            delete e.center_id;
            delete e.code;
            delete e.credit_amt;
            delete e.email;
            delete e.gst;
            delete e.id;
            delete e.is_active;
            delete e.last_paid_date;
            delete e.mobile2;

            delete e.state_id;
            delete e.whatsapp;
        });

        const wb1: xlsx.WorkBook = xlsx.utils.book_new();

        const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);

        ws1['!cols'] = [
            { width: 32 },
            { width: 32 },
            { width: 32 },
            { width: 32 },
            { width: 13 },
            { width: 13 },

            { width: 13 },
            { width: 13 },
            { width: 19 },
        ];

        const wsrows = [
            { hpt: 30 }, // row 1 sets to the height of 12 in points
            { hpx: 30 }, // row 2 sets to the height of 16 in pixels
        ];

        ws1['!rows'] = wsrows; // ws - worksheet

        const merge = [{ s: { c: 0, r: 0 }, e: { c: 1, r: 0 } }];

        ws1['!merges'] = merge;

        xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');

        //then add ur Title txt
        xlsx.utils.sheet_add_json(
            wb1.Sheets.sheet1,
            [
                {
                    header: 'Vendor Reports',
                },
            ],
            {
                skipHeader: true,
                origin: 'A1',
            }
        );

        //start frm A2 here
        xlsx.utils.sheet_add_json(wb1.Sheets.sheet1, reportData, {
            skipHeader: false,
            origin: 'A2',
            header: [
                'Vendor Name',
                'Address 1',
                'Address 2',
                'Address 3',
                'Mobile',
            ],
        });

        xlsx.writeFile(wb1, fileName);
    }

    doInfinite(ev: any) {
        console.log('scrolled down!!', ev);

        this.offset += 50;

        if (this.full_count > this.listArray.length) {
            this.is_loaded = false;
            this.reloadVendors(ev);
        } else {
            this.all_caught_up = 'You have reached the end of the list';
            ev.target.complete();
            this._cdr.detectChanges();
        }
    }
}
