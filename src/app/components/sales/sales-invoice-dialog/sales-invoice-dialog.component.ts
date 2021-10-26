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

            e['CGST'] = e.cgs_t;
            delete e.cgs_t;

            e['SGST'] = e.sgs_t;
            delete e.sgs_t;

            e['IGST'] = e.igs_t;
            delete e.igs_t;

            e['Disc. %'] = e.disc_percent;
            delete e.disc_percent;

            e['HSN Code'] = e.hsn_code;
            delete e.hsn_code;

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
                'Tax',
                'Disc. %',
                'Disc Value',
                'CGST',
                'SGST',
                'IGST',
                'Unit Price',
                'Taxable Value',
                'Total Value',
            ],
        });

        xlsx.writeFile(wb1, fileName);
    }
}
