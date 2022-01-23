import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as moment from 'moment';
import { empty, lastValueFrom, Observable } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { ConvertToSaleDialogComponent } from 'src/app/components/convert-to-sale-dialog/convert-to-sale-dialog.component';
import { EnquiryPrintComponent } from 'src/app/components/enquiry-print/enquiry-print.component';
import { InvoiceSuccessComponent } from 'src/app/components/invoice-success/invoice-success.component';
import { SalesInvoiceDialogComponent } from 'src/app/components/sales/sales-invoice-dialog/sales-invoice-dialog.component';
import { SalesReturnDialogComponent } from 'src/app/components/sales/sales-return-dialog/sales-return-dialog.component';
import { SearchCustomersComponent } from 'src/app/components/search-customers/search-customers.component';
import { SearchInvoiceNoComponent } from 'src/app/components/search-invoice-no/search-invoice-no.component';

import { Customer } from 'src/app/models/Customer';
import { User } from 'src/app/models/User';
import { HelperUtilsService } from 'src/app/services/helper-utils.service';
import * as xlsx from 'xlsx';
import { Sale } from '../../models/Sale';
import { AuthenticationService } from '../../services/authentication.service';
import { CommonApiService } from '../../services/common-api.service';

@Component({
    selector: 'app-search-stock-issues',
    templateUrl: './search-stock-issues.page.html',
    styleUrls: ['./search-stock-issues.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchStockIssuesPage implements OnInit {
    @ViewChild('menuTriggerN', { static: true }) menuTriggerN: any;
    @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    @ViewChild(SearchCustomersComponent) child: SearchCustomersComponent;

    sales$: Observable<any>;

    draftSales$: Observable<Sale[]>;
    full_filled_sales$: Observable<Sale[]>;

    filteredSales$: Observable<any>;

    filteredValues: any;
    tabIndex = 1;

    resultList: any;

    statusFlag = 'D';

    sale_typeFlag = 'all';

    orderDefaultFlag = 'desc';

    today = new Date();
    submitForm: FormGroup;
    maxDate = new Date();
    minDate = new Date();
    dobMaxDate = new Date();

    from_date = new Date();
    to_date = new Date();

    filteredCustomer: Observable<any>;
    customer_lis: Customer[];

    user_data: any;

    user_data$: Observable<User>;

    orderList = [
        { id: 'desc', value: 'Recent Orders First' },
        { id: 'asc', value: 'Old Orders First' },
    ];

    sale_typeList = [
        { id: 'all', value: 'All' },
        { id: 'GI', value: 'Invoice' },
    ];

    sumTotalValue = 0.0;
    sumNumItems = 0;

    permissions_data = [];
    permissions$: Observable<any>;

    deleteAccess;

    arr: Array<any>;

    visible = true;
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    fruitCtrl = new FormControl();
    filteredFruits: Observable<string[]>;
    fruits: string[] = ['Lemon'];
    allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

    searchByDays = 7;
    isCLoading = false;
    customer_data: any;

    name: string;
    clickedColumn: string;

    isCustomDateFilter = false;

    filter_from_date: any;
    filter_to_date: any;

    dateFrom: any = new Date();
    dateTo: any = new Date();

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
        public alertController: AlertController,
        public _dialog: MatDialog,
        public _dialog1: MatDialog,
        private _snackBar: MatSnackBar,
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
            sale_type: new FormControl('all'),
            invoice_no: [''],
            invoice_type: new FormControl('SI'),
            order: ['desc'],
        });

        this.user_data$ = this._authService.currentUser;

        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.user_data = data;
                this.init();
                this._cdr.markForCheck();
            });

        const dateOffset = 24 * 60 * 60 * 1000 * 7;
        this.from_date.setTime(this.minDate.getTime() - dateOffset);

        this._route.params.subscribe((params) => {
            if (this.user_data !== undefined) {
                this.init();
            }
        });

        this.permissions$ = this._authService.currentPermission;

        this.permissions$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.permissions_data = data;

                if (Array.isArray(this.permissions_data)) {
                    this.deleteAccess = this.permissions_data.filter(
                        (f) => f.resource === 'SALE' && f.operation === 'DELETE'
                    )[0].is_access;
                }

                this._cdr.markForCheck();
            });
    }

    async init() {
        this.all_caught_up = '';
        this.offset = 0;
        this.searchCustomers();
        this.isSelectedColumn('Date');
        this.is_loaded = false;
        this.search('');
        this._cdr.markForCheck();
    }

    ngOnInit() {}

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
                            center_id: this.user_data.center_id,
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

    clearInput() {
        this.submitForm.patchValue({
            customer_id: 'all',
            customer_ctrl: '',
        });
        this._cdr.markForCheck();
        this.is_loaded = false;
        this.offset = 0;
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

    async handleCustomerChange() {
        this.clearInput();
    }

    getPosts(event) {
        this.submitForm.patchValue({
            customer_id: event.option.value.id,
            customer_ctrl: event.option.value.name,
        });

        this.tabIndex = 1;

        this._cdr.markForCheck();
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
        this.is_loaded = false;
        this.search('');
    }

    customDateFilter() {
        this.isCustomDateFilter = !this.isCustomDateFilter;
    }

    async search(event) {
        this.sales$ = this._commonApiService.searchSales({
            center_id: this.user_data.center_id,
            customer_id: this.submitForm.value.customer_id,
            status: this.submitForm.value.status,
            from_date: this.submitForm.value.from_date,
            to_date: this.submitForm.value.to_date,
            invoice_type: this.submitForm.value.invoice_type,

            invoice_no: this.submitForm.value.invoice_no,
            order: this.submitForm.value.order,
            offset: this.offset,
            length: this.length,
        });

        this.filteredSales$ = this.sales$;

        const value = await lastValueFrom(this.filteredSales$);

        if (event === '') {
            this.full_count = value.full_count;
            this.tempListArray = value.result;
            if (this.submitForm.value.status === 'C') {
                this.filteredValues = value.result.filter(
                    (data: any) => data.status === 'C'
                );
            } else if (this.submitForm.value.status === 'D') {
                this.filteredValues = value.result.filter(
                    (data: any) => data.status === 'D'
                );
            } else {
                this.filteredValues = value.result;
            }
        } else {
            this.full_count = value.full_count;

            if (this.submitForm.value.status === 'C') {
                this.filteredValues = this.tempListArray.concat(
                    value.result.filter((data: any) => data.status === 'C')
                );
            } else if (this.submitForm.value.status === 'D') {
                this.filteredValues = this.tempListArray.concat(
                    value.result.filter((data: any) => data.status === 'D')
                );
            } else {
                this.filteredValues = this.tempListArray.concat(value.result);
            }

            this.tempListArray = this.filteredValues;

            event.target.complete();
            this._cdr.detectChanges();
        }

        this.is_loaded = true;

        this.calculateSumTotals();
        this.tabIndex = 1;
        this._cdr.markForCheck();
    }

    goPrintInvoice(row) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '600px';

        dialogConfig.data = row;

        const dialogRef = this._dialog.open(
            InvoiceSuccessComponent,
            dialogConfig
        );

        // dialogRef.afterClosed();
        dialogRef.afterClosed().subscribe((result) => {
            this.is_loaded = false;
            this.search('');
        });
    }

    sortInvoice_no() {
        this.clickedColumn = 'Invoice';
        if (this.orderDefaultFlag === 'desc') {
            this.submitForm.patchValue({
                order: 'asc',
            });
            this.orderDefaultFlag = 'asc';
        } else {
            this.submitForm.patchValue({
                order: 'desc',
            });
            this.orderDefaultFlag = 'desc';
        }
        this.is_loaded = false;
        this.search('');
    }

    sortInvoiceDate() {
        this.clickedColumn = 'Date';
        if (this.orderDefaultFlag === 'desc') {
            this.submitForm.patchValue({
                order: 'asc',
            });
            this.orderDefaultFlag = 'asc';
        } else {
            this.submitForm.patchValue({
                order: 'desc',
            });
            this.orderDefaultFlag = 'desc';
        }
        this.is_loaded = false;
        this.search('');
    }

    goPrintEnquiry(row) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '600px';

        dialogConfig.data = row.id;

        const dialogRef = this._dialog.open(
            EnquiryPrintComponent,
            dialogConfig
        );

        dialogRef.afterClosed();
    }

    goSalesAddScreen() {
        this._router.navigateByUrl(`/home/sales/edit/0/TI`);
    }

    to_dateSelected($event) {
        this.to_date = $event.target.value;
        this.tabIndex = 1;

        this._cdr.markForCheck();
    }

    from_dateSelected($event) {
        this.from_date = $event.target.value;
        this.tabIndex = 1;

        this._cdr.markForCheck();
    }

    // two types of delete, (i) Sale Details lineItem, (ii) Sale Master both
    // are different scenarios, just recording it. Only 'DRAFT(D)' or 'STOCK ISSUE(D)' STATUS ARE DELETED
    // first delete sale details(update audit) then delete sale master
    delete(item) {
        this._commonApiService
            .deleteSaleData(item.id)
            .subscribe((data: any) => {
                if (data.status === 'success') {
                    this._commonApiService
                        .deleteSaleMaster(data.id)
                        .subscribe((data1: any) => {
                            this.openSnackBar(
                                'Stock Issue Deleted Successfully',
                                ''
                            );
                            this.init();
                            // //  DELETE ITEM HISTORY RECORD FOR THIS SALE ID
                            // this._commonApiService
                            //     .deleteItemHistory(item.id)
                            //     .subscribe((data2: any) => {
                            //         this.openSnackBar(
                            //             'Deleted Successfully',
                            //             ''
                            //         );
                            //         this.init();
                            //     });
                        });
                }
            });
    }

    async presentAlertConfirm(item) {
        const alert = await this.alertController.create({
            header: 'Confirm!',
            message: 'Permanently removes sale. Are you sure to Delete?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                        console.log('Confirm Cancel: blah');
                    },
                },
                {
                    text: 'Okay',
                    handler: () => {
                        console.log('Confirm Okay');
                        this.delete(item);
                    },
                },
            ],
        });

        await alert.present();
    }

    calculateSumTotals() {
        this.sumTotalValue = 0.0;
        this.sumNumItems = 0;

        this.sumTotalValue = this.filteredValues
            .map((item) => item.net_total)
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
            )
            .toFixed(2);

        this.sumNumItems = this.filteredValues
            .map((item) => item.no_of_items)
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
            );
    }

    async editCompletedSalesConfirm(item) {
        this._router.navigateByUrl(`/home/sales/edit/${item.id}/TI`);
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

    openDialog(row): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.width = '70%';
        dialogConfig.height = '100%';
        dialogConfig.data = row;
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            SalesInvoiceDialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed');
        });
    }

    async presentAlert(msg: string) {
        const alert = await this.alertController.create({
            header: 'Message',

            message: msg,
            buttons: ['OK'],
        });

        await alert.present();
        setTimeout(() => {
            this.init();
        }, 1000);
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 2000,
            panelClass: ['mat-toolbar', 'mat-primary'],
        });
    }
    goSalesReturns() {
        this._router.navigateByUrl(`/home/search-return-sales`);
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

        this.is_loaded = false;
        this.search('');
    }

    async exportCompletedSalesToExcel() {
        const fileName = 'Sale_Order_Reports.xlsx';

        const reportData = JSON.parse(JSON.stringify(this.filteredValues));

        reportData.forEach((e) => {
            delete e.retail_customer_phone;
            delete e.inv_gen_mode;
            delete e.createdAt;
            delete e.created_by;

            e['Customer Name'] = e.customer_name;
            delete e.customer_name;

            e['Invoice #'] = e.invoice_no;
            delete e.invoice_no;

            e['Invoice Date'] = moment(e.invoice_date).format('DD-MM-YYYY');
            delete e.invoice_date;

            delete e.invoice_type;

            e['Total Qty'] = e.total_quantity;
            delete e.total_quantity;

            e['# Items'] = e.no_of_items;
            delete e.no_of_items;

            e['Taxable Value'] = e.after_tax_value;
            delete e.after_tax_value;

            e['Updated By'] = e.updated_by;
            delete e.updated_by;

            e['Print Count'] = e.print_count;
            delete e.print_count;

            e['Updated At'] = moment(e.updatedAt).format('DD-MM-YYYY HH:mm:ss');
            delete e.updatedAt;

            e.CGST = e.cgs_t;
            delete e.cgs_t;

            e.SGST = e.sgs_t;
            delete e.sgs_t;

            e.IGST = e.igs_t;
            delete e.igs_t;

            e.igs_t = e.igs_t;
            delete e.igs_t;

            e['Total Value'] = e.total_value;
            delete e.total_value;

            e['Net Total'] = e.net_total;
            delete e.net_total;

            e['Sale Date Time'] = moment(e.sale_date_time).format(
                'DD-MM-YYYY HH:mm:ss'
            );
            delete e.sale_date_time;

            e.Status = e.status === 'C' ? 'Invoiced' : 'Draft';
            delete e.status;

            delete e.id;
            delete e.center_id;
            delete e.customer_id;
            delete e.lr_no;
            delete e.lr_date;
            delete e.received_date;
            delete e.order_no;
            delete e.order_date;
            delete e.transport_charges;

            delete e.unloading_charges;
            delete e.misc_charges;

            delete e.revision;
            delete e.tax_applicable;
            delete e.stock_issue_ref;
            delete e.stock_issue_date_ref;
            delete e.round_off;
            delete e.retail_customer_name;
            delete e.retail_customer_address;
            delete e.no_of_boxes;
        });

        const wb1: xlsx.WorkBook = xlsx.utils.book_new();

        const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);

        ws1['!cols'] = [
            { width: 16 },
            { width: 16 },
            { width: 32 },
            { width: 14 },
            { width: 8 },
            { width: 8 },
            { width: 13 },
            { width: 13 },
            { width: 13 },
            { width: 13 },
            { width: 13 },
            { width: 13 },
            { width: 19 },
            { width: 12 },
            { width: 16 },
            { width: 19 },
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
                    header: 'Completed Sale Reports',
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
                'Invoice #',
                'Invoice Date',
                'Customer Name',
                'Status',
                'Total Qty',
                '# Items',
                'CGST',
                'SGST',
                'IGST',
                'Taxable Value',
                'Total Value',
                'Net Total',
                'Sale Date Time',
                'Print Count',
                'Updated By',
                'Updated At',
            ],
        });

        xlsx.writeFile(wb1, fileName);
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
            this.is_loaded = false;
            this.search('');
        });
    }

    customerInfoPage(item) {
        this.submitForm.patchValue({
            customer_id: item.id,
        });
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

    isSelectedColumn(param) {
        if (this.clickedColumn === param) {
            return 'sorted_column';
        } else {
            return 'none';
        }
    }

    isCompleted(status: string) {
        if (status === 'C') {
            return 'completed';
        } else {
            return 'draft';
        }
    }

    doInfinite(ev: any) {
        console.log('scrolled down!!', ev);

        this.offset += 20;

        if (this.full_count > this.filteredValues.length) {
            this.is_loaded = false;
            this.search(ev);
        } else {
            this.all_caught_up = 'You have reached the end of the list';
            ev.target.complete();
            this._cdr.detectChanges();
        }
    }

    async presentConvertSaleConfirm(item) {
        const alert = await this.alertController.create({
            header: 'Convert to Invoice!',
            message: 'Converting to Sale Invoice. Are you sure?',
            cssClass: 'alertLogCss',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                        console.log('Confirm Cancel: blah');
                    },
                },
                {
                    text: 'Convert to sale',
                    handler: () => {
                        console.log('Confirm Okay');

                        this.convertToSale(item);
                    },
                },
            ],
        });

        await alert.present();
    }

    convertToSale(item) {
        // pass sale id and call backend
        // refresh the page with latest values (invoice # and inv type)

        this._commonApiService
            .convertToSale({
                center_id: this.user_data.center_id,
                sales_id: item.id,
                old_invoice_no: item.invoice_no,
                old_stock_issued_date: item.invoice_date,
                customer_id: item.customer_id,
                net_total: item.net_total,
            })
            .subscribe((data: any) => {
                if (data.body.result === 'success') {
                    this.convertToInvoiceSuccess(
                        data.body.invoice_no,
                        moment().format('DD-MM-YYYY')
                    );
                }
            });
    }

    convertToInvoiceSuccess(invoice_no, invoice_date) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '400px';

        dialogConfig.data = {
            invoice_no,
            invoice_date,
        };

        const dialogRef = this._dialog.open(
            ConvertToSaleDialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe((data) => {
            console.log('The dialog was closed');
            this.init();
            //this._router.navigateByUrl('/home/search-stock-issues');
        });
    }

    goSalesEditScreen(item) {
        this._router.navigateByUrl(`/home/sales/edit/${item.id}/SI`);
    }
}
