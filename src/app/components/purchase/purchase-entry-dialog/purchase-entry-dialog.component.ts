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

import * as xlsx from 'xlsx';

@Component({
    selector: 'app-purchase-entry-dialog',
    templateUrl: './purchase-entry-dialog.component.html',
    styleUrls: ['./purchase-entry-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseEntryDialogComponent implements OnInit {
    purchase_master_data: any;
    purchase_details_data: any;
    customer_data: any;
    centerdata: any;

    data: any;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<PurchaseEntryDialogComponent>,
        private _route: ActivatedRoute,
        private _authService: AuthenticationService,
        @Inject(MAT_DIALOG_DATA) data: any,
        public _dialog: MatDialog,
        private _commonApiService: CommonApiService
    ) {
        this.data = data;
    }

    ngOnInit() {
        this._commonApiService
            .purchaseMasterData(this.data.id)
            .subscribe((data: any) => {
                this.purchase_master_data = data[0];

                this._cdr.markForCheck();
            });

        this._commonApiService
            .purchaseDetails(this.data.id)
            .subscribe((data: any) => {
                this.purchase_details_data = data;

                this._cdr.markForCheck();
            });

        this._commonApiService
            .getVendorDetails(this.data.vendor_id)
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

    async exportToExcel() {
        const fileName = `Purchase_Order_Reports_${this.purchase_master_data?.invoice_no}.xlsx`;

        const reportData = JSON.parse(
            JSON.stringify(this.purchase_details_data)
        );

        reportData.forEach((e) => {
            e['Product Code'] = e.product_code;
            delete e.product_code;

            e.Description = e.product_description;
            delete e.product_description;

            e.HSNCode = e.hsn_code;
            delete e.hsn_code;

            e.TAX = e.tax;
            delete e.tax;

            e.MRP = e.mrp;
            delete e.mrp;

            e['Purchase Price'] = e.purchase_price;
            delete e.purchase_price;

            e.Quantity = e.quantity;
            delete e.quantity;

            e['Total Value'] = e.total_value;
            delete e.total_value;

            delete e.id;
            delete e.center_id;
            delete e.batch_date;
            delete e.cgs_t;
            delete e.igs_t;
            delete e.packet_size;

            delete e.product_id;
            delete e.purchase_id;

            delete e.revision;
            delete e.sgs_t;
            delete e.stock_id;
            delete e.stock_id;
            delete e.tax_value;
            delete e.after_tax_value;
            delete e.tax_rate;
            delete e.total_value;
            delete e.createdAt;
            delete e.updatedAt;
            delete e.created_by;
            delete e.updated_by;
            delete e.stock_pk;
        });

        const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);
        const wb1: xlsx.WorkBook = xlsx.utils.book_new();

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
                    header: 'Purchase Reports',
                    invoice_no: this.purchase_master_data?.invoice_no,
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
                'Product Code',
                'Description',
                'HSNCode',
                'Purchase Price',
                'TAX',
                'MRP',
                'Quantity',
                'Total Value',
            ],
        });

        xlsx.writeFile(wb1, fileName);
    }

    goPurchaseEditScreen() {
        this.close();
        this._router.navigateByUrl(`/home/purchase-order/edit/${this.data.id}`);
    }
}

// after_tax_value: 4125.6
// center_id: 2
// cgs_t: 0
// createdAt: null
// created_by: null
// id: 839
// igs_t: 3719.22
// invoice_date: "2021-12-01T18:30:00.000Z"
// invoice_no: "7295230557"
// lr_date: "2021-12-01T18:30:00.000Z"
// lr_no: "233673197"
// misc_charges: 0
// net_total: 24382
// no_of_boxes: 7
// no_of_items: 6
// order_date: null
// order_no: ""
// purchase_type: "GST Invoice"
// received_date: "2021-12-12T18:30:00.000Z"
// revision: 4
// round_off: 0.42
// sgs_t: 0
// status: "C"
// stock_inwards_date_time: "2021-12-14T06:06:36.000Z"
// total_quantity: 46
// total_value: 24381.58
// transport_charges: 0
// unloading_charges: 0
// updatedAt: null
// updated_by: null
// vendor_id: 10
// vendor_name: "Mahindra & Mahindra LTD"

// after_tax_value: 7263.2
// batch_date: "2021-12-13T18:30:00.000Z"
// center_id: null
// cgs_t: 0
// createdAt: null
// created_by: null
// hsn_code: "87089900"
// id: 9183
// igs_t: 18
// mrp: 1335
// packet_size: 1
// product_code: "P280914C"
// product_description: "Bar- Stablizer (Left)(Modified)"
// product_id: 69426
// purchase_id: 839
// purchase_price: 726.32
// quantity: 10
// revision: 4
// sgs_t: 0
// stock_id: 76937
// stock_pk: 76937
// tax: 18
// tax_rate: 18
// total_value: 8570.58
// updatedAt: null
// updated_by: null
