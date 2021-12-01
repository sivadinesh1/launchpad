import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
    selector: 'app-edit-receivables',
    templateUrl: './edit-receivables.page.html',
    styleUrls: ['./edit-receivables.page.scss'],
})
export class EditReceivablesPage implements OnInit {
    payment_master: any;
    payment_details: any;

    constructor(
        private _authService: AuthenticationService,
        private _cdr: ChangeDetectorRef,
        private _dialog: MatDialog,
        private _commonApiService: CommonApiService,
        private _route: ActivatedRoute,
        private _router: Router,
        public _dialog1: MatDialog,
        private _fb: FormBuilder
    ) {
        this._route.data.subscribe((data) => {
            this.payment_master = data.payments_data[0][0];
            this.payment_details = data.payments_data[1];
        });
    }

    ngOnInit() {}
}
