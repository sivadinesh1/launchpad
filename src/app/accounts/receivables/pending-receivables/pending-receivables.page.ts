import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import { empty, lastValueFrom, Observable } from 'rxjs';
import { Customer } from 'src/app/models/Customer';
import * as moment from 'moment';
import { SearchInvoiceNoComponent } from 'src/app/components/search-invoice-no/search-invoice-no.component';
import { SearchCustomersComponent } from 'src/app/components/search-customers/search-customers.component';
import * as xlsx from 'xlsx';
import { SalesInvoiceDialogComponent } from 'src/app/components/sales/sales-invoice-dialog/sales-invoice-dialog.component';
import { PrintReceivablesComponent } from 'src/app/components/receivables/print-receivables/print-receivables.component';
import { ApplyNowComponent } from 'src/app/components/receivables/apply-now/apply-now.component';

@Component({
    selector: 'app-pending-receivables',
    templateUrl: './pending-receivables.page.html',
    styleUrls: ['./pending-receivables.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingReceivablesPage implements OnInit {
    @ViewChild('menuTriggerN', { static: true }) menuTriggerN: any;
    @ViewChild(SearchCustomersComponent) child: SearchCustomersComponent;

    pending_receivables_array;

    orderDefaultFlag = 'desc';

    today = new Date();
    submitForm: FormGroup;
    maxDate = new Date();
    minDate = new Date();
    dobMaxDate = new Date();

    isCLoading = false;
    customer_data: any;

    name: string;
    clickedColumn: string;

    isCustomDateFilter = false;

    filter_from_date: any;
    filter_to_date: any;

    dateFrom: any = new Date();
    dateTo: any = new Date();

    from_date = new Date();
    to_date = new Date();

    filteredCustomer: Observable<any[]>;
    customer_lis: Customer[];
    searchByDays = 14;

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
            debugger;
            this.pending_receivables_array = data.pending_receivables_data.body;
        });

        this.submitForm = this._fb.group({
            customer_id: 'all',
            customer_ctrl: new FormControl({
                value: '',
                disabled: false,
            }),

            to_date: [this.to_date, Validators.required],
            from_date: [this.from_date, Validators.required],

            invoice_no: [''],

            order: ['desc'],
        });

        const dateOffset = 24 * 60 * 60 * 1000 * this.searchByDays;
        this.from_date.setTime(this.minDate.getTime() - dateOffset);
    }

    ngOnInit() {}

    test(item) {
        console.log(item);
    }

    customDateFilter() {
        this.isCustomDateFilter = !this.isCustomDateFilter;
    }

    setCustomerInfo(event, from) {
        if (event !== undefined) {
            if (from === 'tab') {
                this.customer_data = event;

                this._cdr.detectChanges();
            } else {
                this.customer_data = event.option.value;

                this._cdr.detectChanges();
            }
        }
    }

    displayFn(obj: any): string | undefined {
        return obj && obj.name ? obj.name : undefined;
    }

    dateFilter(value: number) {
        this.searchByDays = value;
        const dateOffset = 24 * 60 * 60 * 1000 * this.searchByDays;
        this.from_date = new Date(this.minDate.getTime() - dateOffset);
        this.submitForm.patchValue({
            from_date: this.from_date,
        });

        this._cdr.detectChanges();

        this.search();
    }

    customerInfoPage(item) {
        this.submitForm.patchValue({
            customer_id: item.id,
        });
        this.search();
    }

    clearInput() {
        this.submitForm.patchValue({
            customer_id: 'all',
            customer_ctrl: '',
        });
        this._cdr.markForCheck();
        this.search();
    }

    statusFilterChanged(item: any) {
        this.submitForm.patchValue({
            status: item.detail.value,
            invoice_no: '',
        });
        this._cdr.markForCheck();
        this.search();
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

    openDialog1(): void {
        const rect = this.menuTriggerN.nativeElement.getBoundingClientRect();
        console.log('zzz' + rect.left);

        const dialogRef = this._dialog1.open(SearchInvoiceNoComponent, {
            width: '250px',
            data: { invoice_no: '' },

            position: { left: `${rect.left}px`, top: `${rect.bottom - 50}px` },
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed');

            this.submitForm.patchValue({
                invoice_no: result,
            });
            this.search();
        });
    }

    openDialog(row): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.width = '50%';
        dialogConfig.height = '100%';
        dialogConfig.data = row;
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            PrintReceivablesComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed');
        });
    }

    reset() {
        this.child.clearCustomerInput();
        this.clear();
    }

    search() {
        this._commonApiService
            .getPendingReceivablesByCenter(this.submitForm.value)
            .subscribe((data) => {
                this.pending_receivables_array = data.body;
                this._cdr.markForCheck();
            });
    }

    reloadSearch() {
        // patch it up with from & to date, via patch value
        console.log(this.submitForm.value);

        this.search();
    }

    customerSearchReset() {
        this.clearInput();
    }

    clear() {
        const dateOffset = 24 * 60 * 60 * 1000 * 14;
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
        this.search();
    }

    async exportPaymentsReceived() {
        const fileName = 'Payments-received-Reports.xlsx';

        const reportData = JSON.parse(
            JSON.stringify(this.pending_receivables_array)
        );

        reportData.forEach((e) => {
            e['Payment Date'] = moment(e.payment_date).format('DD-MM-YYYY');
            delete e.payment_date;

            e['Payment #'] = e.payment_no;
            delete e.payment_no;

            e['Customer Name'] = e.customer_name;
            delete e.customer_name;

            e['Invoice #'] = e.invoice_no_xls;
            delete e.invoice_no_xls;
            delete e.invoice_no;

            delete e.invoice_id;
            delete e.center_id;
            delete e.customer_id;
            delete e.id;

            e.Mode = e.payment_mode_name;
            delete e.payment_mode_name;

            e.Amount = e.amount_payed;
            delete e.amount_payed;

            e['Unused Amount'] = e.unused_amount;
            delete e.unused_amount;

            delete e.center_name;
            delete e.center_address_1;
            delete e.center_address_2;
            delete e.center_district;
            delete e.center_gst;
        });

        const wb1: xlsx.WorkBook = xlsx.utils.book_new();

        const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);

        ws1['!cols'] = [
            { width: 16 },
            { width: 16 },
            { width: 32 },
            { width: 14 },
            { width: 13 },
            { width: 13 },
            { width: 40 },
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
                    header: 'Payment Received Reports',
                    from_date: `From: ${moment(
                        this.submitForm.value.from_date
                    ).format('DD/MM/YYYY')}`,
                    to_date: `To: ${moment(
                        this.submitForm.value.to_date
                    ).format('DD/MM/YYYY')}`,
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
                'Payment Date',
                'Payment #',
                'Customer Name',
                'Mode',
                'Amount',
                'Unused Amount',
                'Invoice #',
            ],
        });

        xlsx.writeFile(wb1, fileName);
    }

    addReceivables() {
        this._router.navigate([`/home/add-receivables`]);
    }

    goPendingReceivables() {
        this._router.navigate([`/home/pending-receivables`]);
    }

    onSubmit() {}

    applyNow(item): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.width = '70%';
        dialogConfig.height = '100%';
        dialogConfig.data = item;
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(ApplyNowComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed');
        });
    }
}

// aging_days: 5
// balance_due: 0
// invoice_amount: 968
// invoice_date: "2021-12-02T18:30:00.000Z"
// invoice_no: "21/12/002845"
// name: "dinesh"
// sale_ref_id: 4152
