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

import { Customer } from 'src/app/models/Customer';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';

import { User } from 'src/app/models/User';
import { filter, tap, catchError } from 'rxjs/operators';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Observable, lastValueFrom, of } from 'rxjs';
import * as xlsx from 'xlsx';
import { CustomerAddDialogComponent } from 'src/app/components/customers/customer-add-dialog/customer-add-dialog.component';
import { CustomerEditDialogComponent } from 'src/app/components/customers/customer-edit-dialog/customer-edit-dialog.component';
import { CustomerEditShippingAddressComponent } from 'src/app/components/customers/customer-edit-shipping-address/customer-edit-shipping-address.component';
import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { DefaultDiscountsComponent } from 'src/app/components/customers/discount/default-discounts/default-discounts.component';
import { BrandDiscountsComponent } from 'src/app/components/customers/discount/brand-discounts/brand-discounts.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingService } from 'src/app/services/loading.service';
import { HelperUtilsService } from 'src/app/services/helper-utils.service';

@Component({
    selector: 'app-view-customer',
    templateUrl: './view-customer.page.html',
    styleUrls: ['./view-customer.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewCustomerPage {
    @ViewChild('mySearchbar', { static: true }) searchbar: IonSearchbar;

    center_id: any;
    customer$: Observable<Customer[]>;
    user_data$: Observable<User>;
    user_data: any;
    isTableHasData = true;
    arr: Array<any>;

    ready = 0;
    pcount: any;
    noMatch: any;
    responseMsg: string;
    pageLength: any;

    customersOriglist: any;

    is_loaded = false;
    isactive = true;

    displayedColumns: string[] = ['name', 'address1', 'credit', 'actions'];

    errorMessage: string;

    resultArray = [];

    constructor(
        private _authService: AuthenticationService,
        private _cdr: ChangeDetectorRef,
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private _commonApiService: CommonApiService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _loadingService: LoadingService,
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
            this.init();
        });
    }

    init() {
        this.reloadCustomers();
    }

    //   of([1,2,3]).subscribe({
    //     next: (v) => console.log(v),
    //     error: (e) => console.error(e),
    //     complete: () => console.info('complete')
    // })

    reloadCustomers() {
        this.is_loaded = false;
        this._commonApiService.getAllActiveCustomers().subscribe({
            next: (data: any) => {
                this.arr = data;
                this.is_loaded = true;
                this.resultArray = data;
                this._cdr.markForCheck();
            },
            error: (e) => console.error(e),
            complete: () => {},
        });
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
            CustomerAddDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    // this.reloadCustomers();
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    this._loadingService.openSnackBar(
                        'Customer added successfully',
                        ''
                    );
                }
            });
    }

    edit(customer: Customer) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '500px';
        dialogConfig.height = '100%';
        dialogConfig.position = { top: '0', right: '0' };
        dialogConfig.data = customer;
        dialogConfig.panelClass = 'app-full-bleed-dialog';

        const dialogRef = this._dialog.open(
            CustomerEditDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    // this.reloadCustomers();
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
                    dialogConfigSuccess.data = 'Customer updated successfully';

                    this._dialog.open(
                        SuccessMessageDialogComponent,
                        dialogConfigSuccess
                    );
                }
            });
    }

    editShippingAddress(customer: Customer) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.width = '80%';
        dialogConfig.height = '80%';
        dialogConfig.data = customer;

        const dialogRef = this._dialog.open(
            CustomerEditShippingAddressComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    // this.reloadCustomers();
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
                    dialogConfigSuccess.data = 'Customer updated successfully';

                    this._dialog.open(
                        SuccessMessageDialogComponent,
                        dialogConfigSuccess
                    );
                }
            });
    }

    goCustomerFinancial(item) {
        this._router.navigate([
            `/home/financial-customer/${this.center_id}/${item.id}`,
        ]);
    }

    reset() {
        this.searchbar.value = '';
    }

    editdefault(element) {
        this._commonApiService
            .getAllCustomerDefaultDiscounts(element.id)
            .subscribe((data: any) => {
                const dialogConfig = new MatDialogConfig();
                dialogConfig.disableClose = true;
                dialogConfig.autoFocus = true;
                dialogConfig.width = '300px';
                dialogConfig.height = '100%';
                dialogConfig.data = data[0];
                dialogConfig.position = { top: '0', right: '0' };

                const dialogRef = this._dialog.open(
                    DefaultDiscountsComponent,
                    dialogConfig
                );

                dialogRef
                    .afterClosed()
                    .pipe(
                        filter((val) => !!val),
                        tap(() => {
                            // this.reloadCustomers();
                            this._cdr.markForCheck();
                        })
                    )
                    .subscribe((data1: any) => {
                        if (data1.body === 1) {
                            const dialogConfigSuccess = new MatDialogConfig();
                            dialogConfigSuccess.disableClose = false;
                            dialogConfigSuccess.autoFocus = true;
                            dialogConfigSuccess.width = '25%';
                            dialogConfigSuccess.height = '25%';
                            dialogConfigSuccess.data =
                                'Discount updated successfully';

                            this._dialog.open(
                                SuccessMessageDialogComponent,
                                dialogConfigSuccess
                            );
                        }
                    });
            });
    }

    manageBrandDiscounts(element) {
        this._commonApiService
            .getAllCustomerDefaultDiscounts(element.id)
            .subscribe((data: any) => {
                const dialogConfig = new MatDialogConfig();
                dialogConfig.disableClose = true;
                dialogConfig.autoFocus = true;
                dialogConfig.width = '80%';
                dialogConfig.height = '80%';
                dialogConfig.data = data;

                const dialogRef = this._dialog.open(
                    BrandDiscountsComponent,
                    dialogConfig
                );

                dialogRef
                    .afterClosed()
                    .pipe(
                        filter((val) => !!val),
                        tap(() => {
                            // this.reloadCustomers();
                            this._cdr.markForCheck();
                        })
                    )
                    .subscribe((data2: any) => {
                        if (data2 === 'success') {
                            this._loadingService.openSnackBar(
                                'Discounts added successfully',
                                ''
                            );
                        }
                    });
            });
    }

    openDialog(filterValue: any): void {
        const search_text =
            filterValue.target === undefined
                ? filterValue
                : filterValue.target.value;

        this._commonApiService
            .getCustomerInfo({
                center_id: this.center_id,
                search_text: search_text.trim(),
            })
            .subscribe((data: any) => {
                this.is_loaded = true;
                this.resultArray = data;

                this.resultArray = data.body;
                this.pageLength = data.body.length;

                if (data.body.length === 0) {
                    this.isTableHasData = false;
                } else {
                    this.isTableHasData = true;
                }

                if (search_text.trim().length === 0) {
                    this.reset();
                    this.isTableHasData = false;
                }

                this._cdr.detectChanges();
            });
    }

    async exportCustomerDataToExcel() {
        const fileName = 'customer_list.xlsx';

        const reportData = this.resultArray;

        reportData.forEach((e) => {
            e['Customer Name'] = e.customer_name;
            delete e.vendor_name;

            e['Address 1'] = e.address1;
            delete e.address1;

            e['Address 2'] = e.address2;
            delete e.address2;

            e.District = e.district;
            delete e.district;

            e.Pin = e.pin;
            delete e.pin;

            e.State = e.description;
            delete e.description;

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
                    header: 'Customer Reports',
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
                'Customer Name',
                'Address 1',
                'Address 2',
                'Address 3',
                'Mobile',
            ],
        });

        xlsx.writeFile(wb1, fileName);
    }
}

// address1: "3, Maniakarampalayam, Sengalipalayam Post "
// address2: "Idikarai Village "
// balance_amt: 0
// center_id: 2
// code: "33"
// credit_amt: 0
// description: "TAMIL NADU"
// district: "Coimbatore "
// email: ""
// gst: "33AACCA7524Q1ZF"
// id: 540
// is_active: "A"
// last_paid_date: "11-Aug-2021"
// mobile: "9600917128"
// mobile2: ""
// name: " APM Auto Parts Private Limited"
// phone: ""
// pin: "641022"
// state_id: 26
// whatsapp: ""
