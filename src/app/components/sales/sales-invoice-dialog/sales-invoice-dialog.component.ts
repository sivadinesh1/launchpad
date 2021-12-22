import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
    MatDialog,
    MatDialogConfig,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Customer } from 'src/app/models/Customer';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import { CustomerViewDialogComponent } from '../../customers/customer-view-dialog/customer-view-dialog.component';
import * as xlsx from 'xlsx';
import { InvoiceSuccessComponent } from '../../invoice-success/invoice-success.component';

import { SalesReturnDialogComponent } from '../sales-return-dialog/sales-return-dialog.component';
import { AlertController } from '@ionic/angular';

@Component({
    selector: 'app-sales-invoice-dialog',
    templateUrl: './sales-invoice-dialog.component.html',
    styleUrls: ['./sales-invoice-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesInvoiceDialogComponent implements OnInit {
    @ViewChild('epl_table', { static: false }) epl_table: ElementRef;

    sale_master_data: any;
    sale_details_data: any;
    customer_data: any;

    data: any;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<SalesInvoiceDialogComponent>,
        private _route: ActivatedRoute,
        private _authService: AuthenticationService,
        @Inject(MAT_DIALOG_DATA) data: any,
        public _dialog: MatDialog,
        private _commonApiService: CommonApiService,
        public alertController: AlertController
    ) {
        this.data = data;
    }

    ngOnInit() {
        this._commonApiService
            .getSaleMasterData(this.data.id)
            .subscribe((data: any) => {
                this.sale_master_data = data[0];

                this._cdr.markForCheck();
            });

        this._commonApiService
            .getSaleDetailsData(this.data.id)
            .subscribe((data: any) => {
                this.sale_details_data = data;

                this._cdr.markForCheck();
            });

        this._commonApiService
            .getCustomerDetails(this.data.customer_id)
            .subscribe((data: any) => {
                this.customer_data = data[0];

                this._cdr.markForCheck();
            });

        this.dialogRef.keydownEvents().subscribe((event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });

        this.dialogRef.backdropClick().subscribe((event) => {
            this.close();
        });
    }

    close() {
        this.dialogRef.close();
    }

    // exportToExcel() {
    //     const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(
    //         this.epl_table.nativeElement
    //     );
    //     ws['!cols'] = [];
    //     ws['!cols'][1] = { hidden: true };
    //     const wb: xlsx.WorkBook = xlsx.utils.book_new();
    //     xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    //     xlsx.writeFile(wb, 'epltable.xlsx');
    // }

    goPrintInvoice(row) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '400px';

        dialogConfig.data = row.id;

        const dialogRef = this._dialog.open(
            InvoiceSuccessComponent,
            dialogConfig
        );

        dialogRef.afterClosed();
    }

    salesReturn(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '60%';
        dialogConfig.height = '100%';
        dialogConfig.data = this.data;
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            SalesReturnDialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'success') {
                // throw success alert
                this.presentAlert('Return Recorded successfully!');
            }
        });
    }

    async presentAlert(msg: string) {
        const alert = await this.alertController.create({
            header: 'Message',

            message: msg,
            buttons: ['OK'],
        });

        await alert.present();
        setTimeout(() => {
            // this.init();
        }, 1000);
    }

    async exportToExcel() {
        // const fileName = 'Sale_Report.xlsx';

        const fileName = `Sale_${this.sale_master_data?.invoice_no}_Report.xlsx`;

        const reportData = JSON.parse(JSON.stringify(this.sale_details_data));

        reportData.forEach((e) => {
            e['Taxable Value'] = e.after_tax_value;
            delete e.after_tax_value;

            e['Mrp'] = e.mrp;
            delete e.mrp;

            e['Disc. %'] = e.disc_percent;
            delete e.disc_percent;

            e['HSN Code'] = e.product.hsn_code;
            delete e.product.hsn_code;

            e['Item Code'] = e.product.product_code;
            delete e.product.product_code;

            e['Item Description'] = e.product.product_description;
            delete e.product.product_description;

            e['Quantity'] = e.quantity;
            delete e.quantity;

            e['Tax'] = e.tax;
            delete e.tax;

            e['Total Value'] = e.total_value;
            delete e.total_value;

            e['Unit Price'] = e.unit_price;
            delete e.unit_price;

            e['Disc Value'] = e.disc_value;
            delete e.disc_value;

            delete e.igs_t;
            delete e.cgs_t;
            delete e.sgs_t;
            delete e.batch_date;
            delete e.center_id;
            delete e.customer_id;
            delete e.id;
            delete e.product_id;
            delete e.sale_id;
            delete e.createdAt;
            delete e.created_by;
            delete e.updatedAt;
            delete e.updated_by;
            delete e.stock_id;
            delete e.stock;
            delete e.product;
            delete e.returned;
            delete e.disc_type;
        });

        const wb1: xlsx.WorkBook = xlsx.utils.book_new();

        const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);

        ws1['!cols'] = [
            { width: 16 },
            { width: 32 },
            { width: 16 },
            { width: 11 },
            { width: 8 },
            { width: 8 },
            { width: 13 },
            { width: 10 },
            { width: 10 },
            { width: 10 },
            { width: 13 },
            { width: 13 },
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
                    header: 'Sale Report',
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
                'Item Code',
                'Item Description',
                'HSN Code',
                'Quantity',
                'Mrp',
                'Tax',
                'Disc. %',
                'Disc Value',

                'Unit Price',
                'Taxable Value',
                'Total Value',
            ],
        });

        xlsx.writeFile(wb1, fileName);
    }

    goSalesEditScreen() {
        this.close();
        this._router.navigateByUrl(`/home/sales/edit/${this.data.id}/TI`);
    }
}

// after_tax_value: "335.35"
// batch_date: "2021-12-20T00:00:00.000Z"
// center_id: null
// cgs_t: "14"
// createdAt: null
// created_by: null
// disc_percent: "15"
// disc_type: "NET"
// disc_value: "75.75"
// hsn_code: null
// id: "32885"
// igs_t: "0"
// mrp: "505"
// product: {id: '79636', center_id: '2', brand_id: '6', product_type: 'P', product_code: '200415030A', …}
// product_id: "79636"
// quantity: 1
// returned: 0
// sale_id: "4569"
// sgs_t: "14"
// stock: {id: '24474', center_id: null, product_id: '79636', mrp: '474', available_stock: 1, …}
// stock_id: "24474"
// tax: 28
// total_value: "429.25"
// unit_price: "353.5"
// updatedAt: null
// updated_by: null
