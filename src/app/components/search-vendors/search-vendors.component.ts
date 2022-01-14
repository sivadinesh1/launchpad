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

import { User } from 'src/app/models/User';
import { Vendor } from 'src/app/models/Vendor';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
    selector: 'app-search-vendors',
    templateUrl: './search-vendors.component.html',
    styleUrls: ['./search-vendors.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchVendorsComponent implements OnInit {
    @Output()
    vendorOutput = new EventEmitter<any>();

    @Output()
    vendorSearchResetOutput = new EventEmitter<any>();

    vendor_data: any;

    submitForm: FormGroup;

    vendor_name = '';

    isLoading = false;
    isVLoading = false;
    vendor_lis: Vendor[];

    constructor(
        private _authService: AuthenticationService,
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _commonApiService: CommonApiService,
        private _fb: FormBuilder
    ) {
        console.log('search-vendors component');

        this._cdr.markForCheck();

        this.submitForm = this._fb.group({
            vendor_ctrl: [null],
        });
    }

    ngOnInit() {
        console.log('search-vendors component');
        this.searchVendors();
    }

    // check hardcoded vendor data and empty
    searchVendors() {
        this.submitForm.controls.vendor_ctrl.valueChanges
            .pipe(
                debounceTime(300),
                tap(() => (this.isVLoading = true)),
                switchMap((id: any) => {
                    if (
                        id != null &&
                        id.length !== undefined &&
                        id.length >= 2
                    ) {
                        return this._commonApiService.getVendorInfo({
                            search_text: id,
                        });
                    } else {
                        return empty();
                    }
                })
            )

            .subscribe((data: any) => {
                this.isVLoading = false;
                this.vendor_lis = data.body;

                this._cdr.markForCheck();
            });
    }

    displayFn(obj: any): string | undefined {
        return obj && obj.vendor_name ? obj.vendor_name : undefined;
    }

    clearVendorInput() {
        this.submitForm.patchValue({
            vendor_ctrl: null,
        });
        this.vendor_lis = null;

        this.vendorSearchResetOutput.emit();

        this._cdr.markForCheck();
    }

    setVendorInfo(event, from) {
        if (event !== undefined) {
            if (from === 'tab') {
                this.vendor_data = event;
                this.vendorOutput.emit(this.vendor_data);
                this._cdr.detectChanges();
            } else {
                this.vendor_data = event.option.value;
                this.vendorOutput.emit(this.vendor_data);
                this._cdr.detectChanges();
            }
        }
    }
}
