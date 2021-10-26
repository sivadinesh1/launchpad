import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { empty, Observable } from 'rxjs';
import { debounceTime, tap, switchMap, filter } from 'rxjs/operators';
import { Customer } from 'src/app/models/Customer';
import { User } from 'src/app/models/User';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
    selector: 'app-search-customers',
    templateUrl: './search-customers.component.html',
    styleUrls: ['./search-customers.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchCustomersComponent implements OnInit {
    @Output()
    customerOutput = new EventEmitter<any>();

    @Output()
    customerSearchResetOutput = new EventEmitter<any>();

    customer_data: any;

    submitForm: FormGroup;

    customer_name = '';

    isLoading = false;
    isCLoading = false;
    customer_lis: Customer[];

    constructor(
        private _authService: AuthenticationService,
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _commonApiService: CommonApiService,
        private _fb: FormBuilder
    ) {
        console.log('search-customers component');

        this._cdr.markForCheck();

        this.submitForm = this._fb.group({
            customer_ctrl: [null],
        });
    }

    ngOnInit() {
        console.log('search-customers component');
        this.searchCustomers();
    }

    // check hardcoded customer data and empty
    searchCustomers() {
        this.submitForm.controls.customer_ctrl.valueChanges
            .pipe(
                debounceTime(300),
                tap(() => (this.isCLoading = true)),
                switchMap((id: any) => {
                    if (
                        id != null &&
                        id.length !== undefined &&
                        id.length >= 2
                    ) {
                        return this._commonApiService.getCustomerInfo({
                            center_id: 1,
                            search_text: id,
                        });
                    } else {
                        return empty();
                    }
                })
            )

            .subscribe((data: any) => {
                this.isCLoading = false;
                this.customer_lis = data.body;

                this._cdr.markForCheck();
            });
    }

    displayFn(obj: any): string | undefined {
        return obj && obj.name ? obj.name : undefined;
    }

    clearCustomerInput() {
        this.submitForm.patchValue({
            customer_ctrl: null,
        });
        this.customer_lis = null;

        this.customerSearchResetOutput.emit();

        this._cdr.markForCheck();
    }

    setCustomerInfo(event, from) {
        if (event !== undefined) {
            if (from === 'tab') {
                this.customer_data = event;
                this.customerOutput.emit(this.customer_data);
                this._cdr.detectChanges();
            } else {
                this.customer_data = event.option.value;
                this.customerOutput.emit(this.customer_data);
                this._cdr.detectChanges();
            }
        }
    }
}
