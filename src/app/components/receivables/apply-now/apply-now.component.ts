import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
    MatDialogRef,
    MAT_DIALOG_DATA,
    MatDialog,
} from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
    selector: 'app-apply-now',
    templateUrl: './apply-now.component.html',
    styleUrls: ['./apply-now.component.scss'],
})
export class ApplyNowComponent implements OnInit {
    data: any;
    excess_payments: any = [];

    constructor(
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<ApplyNowComponent>,
        private _route: ActivatedRoute,
        private _authService: AuthenticationService,
        @Inject(MAT_DIALOG_DATA) data: any,
        public _dialog: MatDialog,
        private _commonApiService: CommonApiService,
        public alertController: AlertController
    ) {
        this.data = data;

        this._commonApiService
            .getExcessPaidPayments(this.data.customer_id)
            .subscribe((data1: any) => {
                this.excess_payments = data1;
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
}
