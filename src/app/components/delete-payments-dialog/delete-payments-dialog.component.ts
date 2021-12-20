import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AuthenticationService } from 'src/app/services/authentication.service';

import { CommonApiService } from 'src/app/services/common-api.service';
import { Vendor } from 'src/app/models/Vendor';

@Component({
    selector: 'app-delete-payments-dialog',
    templateUrl: './delete-payments-dialog.component.html',
    styleUrls: ['./delete-payments-dialog.component.scss'],
})
export class DeletePaymentDialogComponent implements OnInit {
    center_id: any;
    submitForm: any;
    payment: any;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        @Inject(MAT_DIALOG_DATA) data: any,
        private dialogRef: MatDialogRef<DeletePaymentDialogComponent>,
        private _route: ActivatedRoute,
        private _authService: AuthenticationService,

        private _commonApiService: CommonApiService
    ) {
        const currentUser = this._authService.currentUserValue;
        this.center_id = currentUser.center_id;

        this.payment = data;
    }

    ngOnInit() {}

    delete() {
        this._commonApiService
            .deletePayment(this.payment.id)
            .subscribe((data: any) => {
                console.log('object.. vendor deleted ..');
                this.dialogRef.close('success');
            });
    }

    cancel() {
        this.dialogRef.close();
    }
}
