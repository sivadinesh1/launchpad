import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewChild,
    Inject,
} from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { SalesInvoiceDialogComponent } from '../../sales/sales-invoice-dialog/sales-invoice-dialog.component';
import { PurchaseEntryDialogComponent } from '../../purchase/purchase-entry-dialog/purchase-entry-dialog.component';

import {
    MatDialog,
    MatDialogConfig,
    DialogPosition,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';

@Component({
    selector: 'app-inventory-reports-dialog',
    templateUrl: './inventory-reports-dialog.component.html',
    styleUrls: ['./inventory-reports-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryReportsDialogComponent implements OnInit {
    resultList = [];

    product_code;
    product_description;
    product_id;
    data;
    constructor(
        private _commonApiService: CommonApiService,

        private _cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) data: any,
        private dialogRef: MatDialogRef<InventoryReportsDialogComponent>
    ) {
        this.product_code = data.product_code;

        this.product_description = data.product_description;
        this.product_id = data.product_id;

        this._commonApiService
            .fetchProductInventoryReports({
                product_id: this.product_id,
            })
            .subscribe((data1: any) => {
                this.resultList = data1.body;
                this._cdr.detectChanges();
            });

        this._cdr.markForCheck();
    }

    ngOnInit() {
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
}
