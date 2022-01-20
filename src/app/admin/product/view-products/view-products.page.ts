import {
    Component,
    OnInit,
    ChangeDetectorRef,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
    ViewEncapsulation,
} from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../../../services/authentication.service';
import { filter, tap } from 'rxjs/operators';

import { User } from '../../../models/User';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';

import { ProductAddDialogComponent } from 'src/app/components/products/product-add-dialog/product-add-dialog.component';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { IProduct } from 'src/app/models/Product';
import { ProductEditDialogComponent } from 'src/app/components/products/product-edit-dialog/product-edit-dialog.component';
import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import { ProductCorrectionDialogComponent } from 'src/app/components/products/product-correction-dialog/product-correction-dialog.component';
import { InventoryReportsDialogComponent } from 'src/app/components/reports/inventory-reports-dialog/inventory-reports-dialog.component';
import { HelperUtilsService } from 'src/app/services/helper-utils.service';

@Component({
    selector: 'app-view-products',
    templateUrl: './view-products.page.html',
    styleUrls: ['./view-products.page.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ViewProductsPage implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    center_id: any;

    pageLength: any;
    isTableHasData = false;

    user_data$: Observable<User>;
    user_data: any;

    displayedColumns: string[] = [
        'productcode',
        'description',
        'name',
        'rackno',
        'avlstock',
        'mrp',
        'actions',
    ];
    dataSource = new MatTableDataSource<IProduct>();

    temp_product_search_text = '';
    mrp_flag = false;

    listArray: any[] = [];
    tempListArray: any[] = [];
    offset = 0;
    length = 50;

    array = [];
    sum = 100;
    throttle = 300;

    full_count = 0;
    is_loaded = false;
    all_caught_up = '';

    constructor(
        private _cdr: ChangeDetectorRef,
        private _commonApiService: CommonApiService,
        private _snackBar: MatSnackBar,
        private _route: ActivatedRoute,
        private _dialog: MatDialog,
        private _router: Router,
        private _authService: AuthenticationService,
        private _modalController: ModalController,
        public _helperUtilsService: HelperUtilsService
    ) {
        this.user_data$ = this._authService.currentUser;
        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.user_data = data;
                this.center_id = this.user_data.center_id;

                this._cdr.markForCheck();
            });

        this._route.params.subscribe((params) => {
            this.init();
        });
    }

    ngOnInit() {
        this.init();
    }

    init() {
        this.offset = 0;
        this.all_caught_up = '';
        this.temp_product_search_text = '';
        this.dataSource.paginator = this.paginator;
        this.is_loaded = false;
        this.getData('', this.offset, this.length, '');
    }

    addProduct() {
        this._router.navigate([`/home/product/add`]);
    }

    editProduct(item) {
        this._router.navigateByUrl(
            `/home/product/edit/${this.center_id}/${item.product_id}`
        );
    }

    openDialog(filterValue: any): void {
        this.offset = 0;
        const search_text =
            filterValue.target === undefined
                ? filterValue
                : filterValue.target.value;
        this.is_loaded = false;
        this.getData(search_text, this.offset, this.length, '');
    }

    getData(search_text, offset, length, event) {
        this._commonApiService
            .getProductInfo({
                search_text: search_text.trim(),
                offset,
                length,
            })
            .subscribe((data: any) => {
                this.temp_product_search_text = search_text.trim();
                this.is_loaded = true;
                if (event === '') {
                    this.full_count = data.body.full_count;
                    this.tempListArray = data.body.result;
                    this.listArray = data.body.result;
                } else {
                    this.full_count = data.body.full_count;
                    this.listArray = this.tempListArray.concat(
                        data.body.result
                    );
                    this.tempListArray = this.listArray;

                    event.target.complete();
                    this._cdr.detectChanges();
                }

                this.dataSource.sort = this.sort;
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

    reset() {
        // this.dataSource.data = [];
        // this.pageLength = 0;
        // this.isTableHasData = false;
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
            ProductAddDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    this.openSnackBar('Product added successfully', '');
                }
            });
    }

    checked(event) {
        if (event.checked) {
            this.mrp_flag = true;
        } else {
            this.mrp_flag = false;
        }
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 2000,
            panelClass: ['mat-toolbar', 'mat-primary'],
        });
    }
    edit(product: IProduct) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.width = '500px';
        dialogConfig.height = '100%';
        dialogConfig.data = product;
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            ProductEditDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    // do nothing
                    this.openDialog(this.temp_product_search_text);
                    this.openSnackBar('Product edited successfully', '');
                    //this._cdr.markForChec();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    // this.openDialog(this.temp_product_search_text);
                }
            });
    }

    correctProduct(product: IProduct) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '600px';
        dialogConfig.height = '100%';
        dialogConfig.data = product;
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            ProductCorrectionDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    // do nothing
                    this.openDialog(this.temp_product_search_text);
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    this.openSnackBar('Product Corrected successfully', '');
                }
            });
    }

    // async showInventoryReportsDialog(element) {
    //     const modal = await this._modalController.create({
    //         component: InventoryReportsDialogComponent,
    //         componentProps: {
    //             center_id: this.center_id,
    //             product_code: element.product_code,
    //             product_id: element.product_id,
    //         },
    //         cssClass: 'select-modal',
    //     });

    //     modal.onDidDismiss().then((result) => {
    //         this._cdr.markForCheck();
    //     });

    //     await modal.present();
    // }

    async showInventoryReportsDialog(element) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '1000px';
        dialogConfig.height = '100%';
        dialogConfig.data = {
            center_id: this.center_id,
            product_code: element.product_code,
            product_id: element.product_id,
        };
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            InventoryReportsDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    // do nothing
                    this.openDialog(this.temp_product_search_text);
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    this.openSnackBar('Product Corrected successfully', '');
                }
            });
    }

    async exportCompletedSalesToExcel() {
        const fileName = `Full_Stock_List_${moment().format(
            'DD-MM-YYYY'
        )}.xlsx`;

        this._commonApiService
            .fetchFullProductInventoryReports({ mrp_split: this.mrp_flag })
            .subscribe((report_data: any) => {
                const reportData = JSON.parse(JSON.stringify(report_data.body));

                reportData.forEach((e) => {
                    e['Brand Name'] = e.brand_name;
                    delete e.brand_name;

                    e.Code = e.product_code;
                    delete e.product_code;

                    e.Description = e.product_description;
                    delete e.product_description;

                    e.MRP = e.mrp;
                    delete e.mrp;

                    e['Avl. Stock'] = e.available_stock;
                    delete e.available_stock;

                    e.UOM = e.uom;
                    delete e.uom;

                    e['Pack Size'] = e.packet_size;
                    delete e.packet_size;

                    e['Last Pur. Price'] = e.purchase_price;
                    delete e.purchase_price;

                    e['HSN Code'] = e.hsn_code;
                    delete e.hsn_code;

                    e.Tax = e.tax_rate;
                    delete e.tax_rate;

                    e['Rack Info'] = e.rack_info;
                    delete e.rack_info;
                });

                const wb1: xlsx.WorkBook = xlsx.utils.book_new();

                const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);

                ws1['!cols'] = [
                    { width: 16 },
                    { width: 16 },
                    { width: 32 },
                    { width: 14 },
                    { width: 8 },
                    { width: 8 },
                    { width: 13 },
                    { width: 13 },
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
                            header: 'Full Item Summary Reports',
                            from_date: `As on: ${moment().format(
                                'DD/MM/YYYY'
                            )}`,
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
                        'Brand Name',
                        'Code',
                        'Description',
                        'MRP',
                        'Avl. Stock',
                        'UOM',
                        'Pack Size',
                        'Last Pur. Price',
                        'HSN Code',
                        'Tax',
                        'Rack Info',
                    ],
                });

                xlsx.writeFile(wb1, fileName);
            });
    }

    async exportCompletedPurchaseToExcel() {
        const fileName = `Full_Stock_List_${moment().format(
            'DD-MM-YYYY'
        )}.xlsx`;

        this._commonApiService
            .fetchFullProductInventoryReports({ mrp_split: this.mrp_flag })
            .subscribe((report_data: any) => {
                const reportData = JSON.parse(JSON.stringify(report_data.body));

                const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);
                const wb1: xlsx.WorkBook = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');

                //then add ur Title txt
                xlsx.utils.sheet_add_json(
                    wb1.Sheets.sheet1,
                    [
                        {
                            header:
                                'Full Stock Report on ' +
                                moment().format('DD-MM-YYYY'),
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
                });

                xlsx.writeFile(wb1, fileName);
            });
    }

    doInfinite(ev: any) {
        console.log('scrolled down!!', ev);

        this.offset += 50;

        if (this.full_count > this.listArray.length) {
            this.is_loaded = false;
            this.getData('', this.offset, this.length, ev);
        } else {
            this.all_caught_up = 'You have reached the end of the list';
            ev.target.complete();
            this._cdr.detectChanges();
        }
    }
}
