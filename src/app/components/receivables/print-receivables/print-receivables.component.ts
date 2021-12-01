import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
    MatDialogRef,
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogConfig,
} from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import { SalesInvoiceDialogComponent } from '../../sales/sales-invoice-dialog/sales-invoice-dialog.component';

@Component({
    selector: 'app-print-receivables',
    templateUrl: './print-receivables.component.html',
    styleUrls: ['./print-receivables.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintReceivablesComponent implements OnInit {
    data: any;
    payment_received_details: any;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<PrintReceivablesComponent>,
        private _route: ActivatedRoute,
        private _authService: AuthenticationService,
        @Inject(MAT_DIALOG_DATA) data: any,
        public _dialog: MatDialog,
        private _commonApiService: CommonApiService,
        public alertController: AlertController
    ) {
        this.data = data;
        console.log(JSON.stringify(this.data));

        this._commonApiService
            .getPaymentsReceivedDetails({
                payment_id: this.data.id,
            })
            .subscribe((data1: any) => {
                this.payment_received_details = data1.body;
                this._cdr.markForCheck();
            });
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

    openDialog(sale_id): void {
        this.close();
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.width = '50%';
        dialogConfig.height = '100%';
        dialogConfig.data = { id: sale_id };
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            SalesInvoiceDialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed');
        });
    }

    editPaymentReceivables() {
        this.close();
        this._router.navigate(['/home/edit-receivables/' + this.data.id]);
    }
}
