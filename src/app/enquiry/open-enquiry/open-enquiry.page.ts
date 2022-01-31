import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewChild,
} from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

import { Customer } from 'src/app/models/Customer';

import { Observable, lastValueFrom } from 'rxjs';
import {
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
} from '@angular/forms';
import { Enquiry } from 'src/app/models/Enquiry';
import { filter, map, startWith, tap } from 'rxjs/operators';

import { MatDialogConfig, MatDialog } from '@angular/material/dialog';

import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { DeleteEnquiryDialogComponent } from 'src/app/components/delete-enquiry-dialog/delete-enquiry-dialog.component';
import { EnquiryViewDialogComponent } from '../../components/enquiry/enquiry-view-dialog/enquiry-view-dialog.component';
import { User } from 'src/app/models/User';
import * as moment from 'moment';
import { IonContent } from '@ionic/angular';
import { SearchCustomersComponent } from 'src/app/components/search-customers/search-customers.component';
import { HelperUtilsService } from 'src/app/services/helper-utils.service';

@Component({
    selector: 'app-open-enquiry',
    templateUrl: './open-enquiry.page.html',
    styleUrls: ['./open-enquiry.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenEnquiryPage implements OnInit {
    @ViewChild(IonContent, { static: false }) content: IonContent;
    @ViewChild(SearchCustomersComponent) child: SearchCustomersComponent;

    openenq: any;
    tabIndex = 0;

    readyforsale: any;
    center_name: string;

    user_data$: Observable<User>;
    user_data: any;

    statusFlag = 'O';
    selectedCust = 'all';
    orderDefaultFlag = 'desc';

    today = new Date();
    submitForm: FormGroup;
    maxDate = new Date();
    minDate = new Date();

    from_date = new Date();
    to_date = new Date();

    filteredValues: any;

    timeline: any;

    navigationSubscription: any;
    customer$: Observable<Customer[]>;
    enquiries$: Observable<any>;

    filteredCustomer: Observable<any>;
    customer_lis: Customer[];

    status: any;

    isCustomDateFilter = false;

    searchByDays = 7;
    tempListArray: any[] = [];
    full_count = 0;
    offset = 0;
    length = 20;
    is_loaded = false;
    all_caught_up = '';

    filter_text = 'ALL';

    constructor(
        private _cdr: ChangeDetectorRef,
        private _commonApiService: CommonApiService,
        private _fb: FormBuilder,
        private _router: Router,
        private _route: ActivatedRoute,
        private _dialog: MatDialog,
        private _authService: AuthenticationService,
        public _helperUtilsService: HelperUtilsService
    ) {
        this.submitForm = this._fb.group({
            customer_id: 'all',
            customer_ctrl: new FormControl({
                value: '',
                disabled: false,
            }),
            //customer_ctrl: [{ value: 'All Customers', disabled: false }],
            to_date: [this.to_date, Validators.required],
            from_date: [this.from_date, Validators.required],
            status: new FormControl('all'),

            order: ['desc'],
        });

        this.user_data$ = this._authService.currentUser;

        const dateOffset = 24 * 60 * 60 * 1000 * 7;
        this.from_date.setTime(this.minDate.getTime() - dateOffset);

        this._route.params.subscribe((params) => {
            this.user_data$
                .pipe(filter((data) => data !== null))
                .subscribe((data: any) => {
                    this.user_data = data;
                    this.init();
                    this.status = params.status;
                    this.timeline = params.timeline;

                    this._cdr.markForCheck();
                });

            this._cdr.markForCheck();
        });
    }

    filter_customer(value: any) {
        if (typeof value == 'object') {
            return this.customer_lis.filter((customer) =>
                customer.name.toLowerCase().match(value.name.toLowerCase())
            );
        } else if (typeof value == 'string') {
            return this.customer_lis.filter((customer) =>
                customer.name.toLowerCase().match(value.toLowerCase())
            );
        }
    }

    ngOnInit() {}

    async init() {
        this.offset = 0;

        this._commonApiService
            .getAllActiveCustomers()
            .subscribe((data: any) => {
                this.customer_lis = data;

                this.filteredCustomer =
                    this.submitForm.controls.customer_ctrl.valueChanges.pipe(
                        startWith(''),
                        map((customer) =>
                            customer
                                ? this.filter_customer(customer)
                                : this.customer_lis.slice()
                        )
                    );
            });
        this.search('');
        this._cdr.markForCheck();
    }

    clearInput() {
        this.submitForm.patchValue({
            customer_id: 'all',
            customer_ctrl: '',
        });
        this._cdr.markForCheck();
    }

    getPosts(event) {
        this.submitForm.patchValue({
            customer_id: event.option.value.id,
            customer_ctrl: event.option.value.name,
        });
        this.tabIndex = 0;
        this._cdr.markForCheck();
    }

    async search(event) {
        //main search
        this.is_loaded = false;

        this.enquiries$ = this._commonApiService.searchEnquiries({
            customer_id: this.submitForm.value.customer_id,
            status: this.submitForm.value.status,
            from_date: this.submitForm.value.from_date,
            to_date: this.submitForm.value.to_date,
            order: this.submitForm.value.order,
            offset: this.offset,
            length: this.length,
        });

        const value = await lastValueFrom(this.enquiries$);

        if (event === '') {
            this.full_count = value.full_count;

            this.tempListArray = value.result;
            this.filteredValues = value.result;
            this.is_loaded = true;
            this._cdr.detectChanges();
        } else {
            this.full_count = value.full_count;

            this.filteredValues = this.tempListArray.concat(value.result);

            this.tempListArray = this.filteredValues;
            this.is_loaded = true;
            event.target.complete();
        }
    }

    processEnquiry(item) {
        this._router.navigate(['/home/enquiry/process-enquiry', item.id]);
    }

    moveToSale(item, invoiceType) {
        this._router.navigate([
            `/home/sales/enquiry/${item.id}/${invoiceType}`,
        ]);
    }

    goEnquiryScreen() {
        this._router.navigateByUrl(`/home/enquiry`);
    }

    openBackOrder() {
        this._router.navigateByUrl('/home/enquiry/back-order');
    }

    statusChange($event) {
        this.statusChange = $event.source.value;
        this._cdr.markForCheck();
    }

    selectedCustomer($event) {
        this.selectedCust = $event.source.value;
    }

    delete(enquiry: Enquiry) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '40%';
        dialogConfig.height = '40%';
        dialogConfig.data = enquiry;

        const dialogRef = this._dialog.open(
            DeleteEnquiryDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    this.init();
                    this._cdr.markForCheck();
                })
            )
            .subscribe((data: any) => {
                if (data === 'success') {
                    const dialogConfigSuccess = new MatDialogConfig();
                    dialogConfigSuccess.disableClose = false;
                    dialogConfigSuccess.autoFocus = true;
                    dialogConfigSuccess.width = '25%';
                    dialogConfigSuccess.height = '25%';
                    dialogConfigSuccess.data =
                        'Inquiry deleted and moved to cancelled status';

                    const dialogRef1 = this._dialog.open(
                        SuccessMessageDialogComponent,
                        dialogConfigSuccess
                    );

                    this.init();
                }
            });
    }

    openDialog(row): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '60%';
        dialogConfig.height = '100%';
        dialogConfig.data = row;
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            EnquiryViewDialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed');
        });
    }

    logScrolling(event) {
        // do nothing
    }

    customerInfoPage(item) {
        this.submitForm.patchValue({
            customer_id: item.id,
        });

        this.search('');
    }

    customDateFilter() {
        this.isCustomDateFilter = !this.isCustomDateFilter;

        if (!this.isCustomDateFilter) {
            this.dateFilter(7);
        }
    }

    dateFilter(value: number) {
        this.ScrollToTop();
        this.searchByDays = value;
        const dateOffset = 24 * 60 * 60 * 1000 * this.searchByDays;
        this.from_date = new Date(this.minDate.getTime() - dateOffset);
        this.submitForm.patchValue({
            from_date: this.from_date,
        });
        this.offset = 0;

        this._cdr.detectChanges();
        this.search('');
    }

    ScrollToTop() {
        if (this.content !== undefined) {
            this.content.scrollToTop(500);
        }
    }

    opsFromDateEvent(event) {
        this.submitForm.patchValue({
            from_date: moment(event.target.value).format('YYYY-MM-DD'),
        });
        this.reloadSearch();
    }

    opsToDateEvent(event) {
        this.submitForm.patchValue({
            to_date: moment(event.target.value).format('YYYY-MM-DD'),
        });

        this.reloadSearch();
    }

    reloadSearch() {
        // patch it up with from & to date, via patch value

        this.offset = 0;

        this.search('');
    }
    customerSearchReset() {
        this.clearInput();
    }
    reset() {
        this.filter_text = 'ALL';
        this.customerSearchReset();
        this.child.clearCustomerInput();
        this.clear();

        this.search('');
    }

    clear() {
        const dateOffset = 24 * 60 * 60 * 1000 * 7;
        this.from_date.setTime(this.minDate.getTime() - dateOffset);

        this.submitForm.patchValue({
            customer_id: 'all',
            status: 'all',
            customer_ctrl: 'All Customers',
            from_date: this.from_date,
            to_date: new Date(),
        });

        this.submitForm.get('customer_ctrl').enable();

        this._cdr.markForCheck();
    }

    statusFilterChanged(status) {
        if (status === 'all') {
            this.filter_text = 'All';
        } else if (status === 'P') {
            this.filter_text = 'INVOICE READY';
        } else if (status === 'X') {
            this.filter_text = 'CANCELLED';
        } else if (status === 'E') {
            this.filter_text = 'CLOSED';
        }

        this.submitForm.patchValue({
            status,
        });
        this._cdr.markForCheck();

        this.offset = 0;
        this.search('');
    }

    doInfinite(ev: any) {
        if (this.full_count >= this.filteredValues.length) {
            this.offset += 20;
            this.is_loaded = false;
            this.search(ev);
        } else {
            this.is_loaded = true;
            this.all_caught_up = 'You have reached the end of the list';
            ev.target.complete();
            this._cdr.detectChanges();
        }
    }
}

// O - New Inquiry
// D - In Progress
// P - Ready to Invoice
// E - Closed Inquiry
// X - Cancelled Inquiry
