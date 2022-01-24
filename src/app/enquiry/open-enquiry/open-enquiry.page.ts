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
import { Vendor } from 'src/app/models/Vendor';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';

import { SuccessMessageDialogComponent } from 'src/app/components/success-message-dialog/success-message-dialog.component';
import { DeleteEnquiryDialogComponent } from 'src/app/components/delete-enquiry-dialog/delete-enquiry-dialog.component';
import { EnquiryViewDialogComponent } from '../../components/enquiry/enquiry-view-dialog/enquiry-view-dialog.component';
import { User } from 'src/app/models/User';
import * as moment from 'moment';
import { IonContent } from '@ionic/angular';
import { SearchCustomersComponent } from 'src/app/components/search-customers/search-customers.component';

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
    backorderValues: any;
    timeline: any;

    orderList = [
        { id: 'desc', value: 'Recent Orders First' },
        { id: 'asc', value: 'Old Orders First' },
    ];

    navigationSubscription: any;
    customer$: Observable<Customer[]>;
    enquiries$: Observable<Enquiry[]>;

    newEnquiries$: Observable<Enquiry[]>;

    invoiceReadyEnquiries$: Observable<Enquiry[]>;
    fullfilledEnquiries$: Observable<Enquiry[]>;

    filteredEnquiries$: Observable<Enquiry[]>;

    filteredCustomer: Observable<any[]>;
    customer_lis: Customer[];

    status: any;
    back_order_lst: any;

    isCustomDateFilter = false;

    searchByDays = 7;
    tempListArray: any[] = [];
    full_count = 0;
    offset = 0;
    length = 20;
    is_loaded = false;
    all_caught_up = '';

    constructor(
        private _cdr: ChangeDetectorRef,
        private _commonApiService: CommonApiService,
        private _fb: FormBuilder,
        private _router: Router,
        private _route: ActivatedRoute,
        private _dialog: MatDialog,
        private _authService: AuthenticationService
    ) {
        // dnd in future, if logic changes to current date minus, use this
        const weekOffset = 24 * 60 * 60 * 1000 * 7;
        const monthOffset = 24 * 60 * 60 * 1000 * 30;
        const yearOffset = 24 * 60 * 60 * 1000 * 365;

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

    filtercustomer(value: any) {
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
        this._commonApiService
            .getAllActiveCustomers()
            .subscribe((data: any) => {
                this.customer_lis = data;

                this.filteredCustomer =
                    this.submitForm.controls.customerctrl.valueChanges.pipe(
                        startWith(''),
                        map((customer) =>
                            customer
                                ? this.filtercustomer(customer)
                                : this.customer_lis.slice()
                        )
                    );
            });

        this._cdr.markForCheck();
    }

    clearInput() {
        this.submitForm.patchValue({
            customerid: 'all',
            customerctrl: '',
        });
        this._cdr.markForCheck();
        this.search('O');
    }

    getPosts(event) {
        this.submitForm.patchValue({
            customerid: event.option.value.id,
            customerctrl: event.option.value.name,
        });
        this.tabIndex = 0;
        this._cdr.markForCheck();
    }

    async search(param) {
        //main search

        this.enquiries$ = this._commonApiService.searchEnquiries({
            center_id: this.user_data.center_id,
            customerid: this.submitForm.value.customerid,
            status: this.submitForm.value.status,
            fromdate: this.submitForm.value.fromdate,
            todate: this.submitForm.value.todate,
            order: this.submitForm.value.order,
        });

        this.filteredEnquiries$ = this.enquiries$;

        const value = await lastValueFrom(this.filteredEnquiries$);

        if (param === 'O') {
            this.filteredValues = value.filter(
                (data: any) => data.estatus === 'O' || data.estatus === 'D'
            );
        } else if (param === 'E') {
            this.filteredValues = value.filter(
                (data: any) => data.estatus === 'E' || data.estatus === 'X'
            );
        } else {
            this.filteredValues = value.filter(
                (data: any) => data.estatus === param
            );
        }

        // to calculate the count on each status
        this.newEnquiries$ = this.enquiries$.pipe(
            map((arr: any) =>
                arr.filter((f) => f.estatus === 'O' || f.estatus === 'D')
            )
        );

        // this.draftEnquiries$ = this.enquiries$.pipe(
        // 	map((arr: any) => arr.filter((f) => f.estatus === 'D'))
        // );
        this.invoiceReadyEnquiries$ = this.enquiries$.pipe(
            map((arr: any) => arr.filter((f) => f.estatus === 'P'))
        );
        this.fullfilledEnquiries$ = this.enquiries$.pipe(
            map((arr: any) =>
                arr.filter((f) => f.estatus === 'E' || f.estatus === 'X')
            )
        );

        this._cdr.markForCheck();
    }

    populateBackOrders() {
        this._commonApiService.getBackOder().subscribe((data: any) => {
            this.back_order_lst = data;
            this._cdr.markForCheck();
        });
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

    async tabClick($event) {
        if (this.filteredEnquiries$ !== undefined) {
            const value = await lastValueFrom(this.filteredEnquiries$);

            if ($event.index === 0 || $event === 0) {
                this.filteredValues = value.filter(
                    (data: any) => data.estatus === 'O' || data.estatus === 'D'
                );
            } else if ($event.index === 1 || $event === 1) {
                this.filteredValues = value.filter(
                    (data: any) => data.estatus === 'P'
                );
            } else if ($event.index === 2 || $event === 2) {
                this.filteredValues = value.filter(
                    (data: any) => data.estatus === 'E' || data.estatus === 'X'
                );
            }

            if ($event.index === 3 || $event === 3) {
                this.populateBackOrders();
            }

            this._cdr.markForCheck();
        }
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
        dialogConfig.width = '50%';
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
        this.is_loaded = false;
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
        this.is_loaded = false;
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
        this.is_loaded = false;
        this.search('');
    }
    customerSearchReset() {
        this.clearInput();
    }
    reset() {
        this.customerSearchReset();
        this.child.clearCustomerInput();
        this.clear();
        this.is_loaded = false;
        this.search('');
    }

    clear() {
        const dateOffset = 24 * 60 * 60 * 1000 * 7;
        this.from_date.setTime(this.minDate.getTime() - dateOffset);

        this.submitForm.patchValue({
            customer_id: 'all',
            customer_ctrl: 'All Customers',
            from_date: this.from_date,
            to_date: new Date(),
            invoice_no: '',
        });

        this.submitForm.value.invoice_no = '';
        this.submitForm.get('customer_ctrl').enable();
        this.submitForm.controls.invoice_no.setErrors(null);
        this.submitForm.controls.invoice_no.markAsTouched();

        this._cdr.markForCheck();
    }

    statusFilterChanged(status) {
        this.submitForm.patchValue({
            status,
            invoice_no: '',
        });
        this._cdr.markForCheck();
        this.is_loaded = false;
        this.offset = 0;
        this.search('');
    }
}

// O - New Inquiry
// D - In Progress
// P - Ready to Invoice
// E - Closed Inquiry
// X - Cancelled Inquiry
