import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation
} from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup, Validators
} from '@angular/forms';
import {
  MatAutocomplete
} from '@angular/material/autocomplete';
import {
  MatDialog,
  MatDialogConfig
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as moment from 'moment';
import { empty, lastValueFrom, Observable } from 'rxjs';
import {
  debounceTime,
  filter,
  map, switchMap,
  tap
} from 'rxjs/operators';
import { EnquiryPrintComponent } from 'src/app/components/enquiry-print/enquiry-print.component';
import {
  InvoiceSuccessComponent
} from 'src/app/components/invoice-success/invoice-success.component';
import { SalesInvoiceDialogComponent } from 'src/app/components/sales/sales-invoice-dialog/sales-invoice-dialog.component';
import { SalesReturnDialogComponent } from 'src/app/components/sales/sales-return-dialog/sales-return-dialog.component';
import { SearchInvoicenoComponent } from 'src/app/components/search-invoiceno/search-invoiceno.component';
import { Customer } from 'src/app/models/Customer';
import { User } from 'src/app/models/User';
import * as xlsx from 'xlsx';
import { Sales } from '../../models/Sales';
import { AuthenticationService } from '../../services/authentication.service';
import { CommonApiService } from '../../services/common-api.service';

@Component({
  selector: 'app-search-sale-order',
  templateUrl: './search-sale-order.page.html',
  styleUrls: ['./search-sale-order.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SearchSaleOrderPage implements OnInit {
  sales$: Observable<Sales[]>;

  draftSales$: Observable<Sales[]>;
  fullfilledSales$: Observable<Sales[]>;

  filteredSales$: Observable<Sales[]>;

  filteredValues: any;
  tabIndex = 1;

  resultList: any;

  statusFlag = 'D';
  selectedCust = 'all';

  saletypeFlag = 'all';

  orderDefaultFlag = 'desc';

  today = new Date();
  submitForm: FormGroup;
  maxDate = new Date();
  minDate = new Date();
  dobMaxDate = new Date();

  fromdate = new Date();
  todate = new Date();

  filteredCustomer: Observable<any[]>;
  customer_lis: Customer[];

  @ViewChild('epltable', { static: false }) epltable: ElementRef;
  @ViewChild('clist', { static: true }) clist: any;

  userdata: any;

  userdata$: Observable<User>;

  statusList = [
    { id: 'all', value: 'All' },
    { id: 'D', value: 'Draft' },
    { id: 'C', value: 'Fullfilled' },
  ];

  orderList = [
    { id: 'desc', value: 'Recent Orders First' },
    { id: 'asc', value: 'Old Orders First' },
  ];

  saletypeList = [
    { id: 'all', value: 'All' },
    { id: 'GI', value: 'Invoice' },
  ];

  searchType = [
    { name: 'All', id: 'all', checked: true },
    { name: 'Invoice Only', id: 'invonly', checked: false },
  ];

  sumTotalValue = 0.0;
  sumNumItems = 0;

  permissionsdata = [];
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

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  searchByDays = 7;
  isCLoading = false;
  customerdata: any;

  animal: string;
  name: string;

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
    private _authservice: AuthenticationService
  ) {
    this.submitForm = this._fb.group({
      customerid: ['all'],
      customerctrl: new FormControl({
        value: '',
        disabled: false,
      }),
      //customerctrl: [{ value: 'All Customers', disabled: false }],
      todate: [this.todate, Validators.required],
      fromdate: [this.fromdate, Validators.required],
      status: new FormControl('all'),
      saletype: new FormControl('all'),
      invoiceno: [''],
      searchtype: ['all'],
      order: ['desc'],
    });

    this.userdata$ = this._authservice.currentUser;

    this.userdata$
      .pipe(filter((data) => data !== null))
      .subscribe((data: any) => {
        this.userdata = data;
        this.init();
        this._cdr.markForCheck();
      });

    const dateOffset = 24 * 60 * 60 * 1000 * 7;
    this.fromdate.setTime(this.minDate.getTime() - dateOffset);

    this._route.params.subscribe((params) => {
      if (this.userdata !== undefined) {
        this.init();
      }
    });

    this.permissions$ = this._authservice.currentPermisssion;

    this.permissions$
      .pipe(filter((data) => data !== null))
      .subscribe((data: any) => {
        this.permissionsdata = data;

        if (Array.isArray(this.permissionsdata)) {
          this.deleteAccess = this.permissionsdata.filter(
            (f) => f.resource === 'SALE' && f.operation === 'DELETE'
          )[0].is_access;
        }

        this._cdr.markForCheck();
      });
  }

  async init() {
    this.searchCustomers();
    this.search();
    this._cdr.markForCheck();
  }

  ngOnInit() {}

  searchCustomers() {
    this.submitForm.controls['customerctrl'].valueChanges
      .pipe(
        debounceTime(300),
        tap(() => (this.isCLoading = true)),
        switchMap((id: any) => {
          if (id != null && id.length !== undefined && id.length >= 2) {
            return this._commonApiService.getCustomerInfo({
              centerid: this.userdata.center_id,
              searchstr: id,
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

  radioClickHandle() {
    if (this.submitForm.value.searchtype === 'invonly') {
      this.submitForm.get('customerctrl').disable();
    } else {
      this.submitForm.value.invoiceno = '';
      this.submitForm.get('customerctrl').enable();
      this.submitForm.controls['invoiceno'].setErrors(null);
      this.submitForm.controls['invoiceno'].markAsTouched();
    }
  }
  // this.yourFormName.controls.formFieldName.enable();

  clearInput() {
    this.submitForm.patchValue({
      customerid: 'all',
      customerctrl: '',
    });
    this._cdr.markForCheck();
    this.search();
  }

  clear() {
    const dateOffset = 24 * 60 * 60 * 1000 * 7;
    this.fromdate.setTime(this.minDate.getTime() - dateOffset);

    this.submitForm.patchValue({
      customerid: ['all'],
      customerctrl: 'All Customers',
      fromdate: this.fromdate,
      todate: new Date(),
      invoiceno: [''],
      searchtype: 'all',
    });

    this.submitForm.value.invoiceno = '';
    this.submitForm.get('customerctrl').enable();
    this.submitForm.controls['invoiceno'].setErrors(null);
    this.submitForm.controls['invoiceno'].markAsTouched();

    this.searchType = [
      { name: 'All', id: 'all', checked: true },
      { name: 'Invoice Only', id: 'invonly', checked: false },
    ];

    this._cdr.markForCheck();
  }

  async handleCustomerChange() {
    this.clearInput();
  }

  getPosts(event) {
    this.submitForm.patchValue({
      customerid: event.option.value.id,
      customerctrl: event.option.value.name,
    });

    this.tabIndex = 1;
    //	this.search();
    this._cdr.markForCheck();
  }

  setCustomerInfo(event, from) {
    if (event !== undefined) {
      if (from === 'tab') {
        this.customerdata = event;

        this._cdr.detectChanges();
      } else {
        this.customerdata = event.option.value;

        this._cdr.detectChanges();
      }
    }
  }

  displayFn(obj: any): string | undefined {
    return obj && obj.name ? obj.name : undefined;
  }

  dateFilter(value: number) {
    this.searchByDays = value;
    const dateOffset = 24 * 60 * 60 * 1000 * 20;
    this.fromdate = new Date(this.minDate.getTime() - dateOffset);

    this._cdr.detectChanges();

    this.search();
  }

  async search() {
    if (
      this.submitForm.value.searchtype !== 'all' &&
      this.submitForm.value.invoiceno.trim().length === 0
    ) {
      console.log('invoice number is mandatory');
      this.submitForm.controls['invoiceno'].setErrors({ required: true });
      this.submitForm.controls['invoiceno'].markAsTouched();
      return false;
    }

    this.sales$ = this._commonApiService.searchSales({
      centerid: this.userdata.center_id,
      customerid: this.submitForm.value.customerid,
      status: this.submitForm.value.status,
      fromdate: this.submitForm.value.fromdate,
      todate: this.submitForm.value.todate,
      saletype: this.submitForm.value.saletype,
      searchtype: this.submitForm.value.searchtype,
      invoiceno: this.submitForm.value.invoiceno,
      order: this.submitForm.value.order,
    });

    this.filteredSales$ = this.sales$;

    let value = await lastValueFrom(this.filteredSales$);

    this.filteredValues = value.filter(
      (data: any) => data.status === 'C' && data.sale_type === 'gstinvoice'
    );

    // to calculate the count on each status
    this.draftSales$ = this.sales$.pipe(
      map((arr: any) =>
        arr.filter((f) => f.status === 'D' && f.sale_type === 'gstinvoice')
      )
    );

    this.fullfilledSales$ = this.sales$.pipe(
      map((arr: any) => arr.filter((f) => f.status === 'C'))
    );
    this.calculateSumTotals();
    this.tabIndex = 1;
    this._cdr.markForCheck();
  }

  goSalesEditScreen(item) {
    if (item.status === 'C') {
      this.editCompletedSalesConfirm(item);
    } else {
      this._router.navigateByUrl(`/home/sales/edit/${item.id}/TI`);
    }
  }

  goPrintInvoice(row) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';

    dialogConfig.data = row;

    const dialogRef = this._dialog.open(InvoiceSuccessComponent, dialogConfig);

    // dialogRef.afterClosed();
    dialogRef.afterClosed().subscribe((result) => {
      this.search();
    });
  }

  goPrintEnquiry(row) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';

    dialogConfig.data = row.id;

    const dialogRef = this._dialog.open(EnquiryPrintComponent, dialogConfig);

    dialogRef.afterClosed();
  }

  goSalesAddScreen() {
    this._router.navigateByUrl(`/home/sales/edit/0/TI`);
  }

  toDateSelected($event) {
    this.todate = $event.target.value;
    this.tabIndex = 1;
    //	this.search();
    this._cdr.markForCheck();
  }

  fromDateSelected($event) {
    this.fromdate = $event.target.value;
    this.tabIndex = 1;
    //this.search();
    this._cdr.markForCheck();
  }

  // two types of delete, (i) Sale Details lineitem, (ii) Sale Master both
  // are different scenarios, just recording it. Only 'DRAFT(D)' or 'STOCKISSUE(D)' STATUS ARE DELETED
  // first delete sale details(update audit) then delete sale master
  delete(item) {
    this._commonApiService.deleteSaleData(item.id).subscribe((data: any) => {
      if (data.result === 'success') {
        this._commonApiService
          .deleteSaleMaster(item.id)
          .subscribe((data1: any) => {
            //  DELETE ITEM HISTORY RECORD FOR THIS SALE ID
            this._commonApiService
              .deleteItemHistory(item.id)
              .subscribe((data: any) => {
                this.openSnackBar('Deleted Successfully', '');
                this.init();
              });
          });
      }
    });
  }

  async presentAlertConfirm(item) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Permantently removes sale. Are you sure to Delete?',
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

  async tabClick($event) {
    let value = await lastValueFrom(this.filteredSales$);

    if ($event.index === 0) {
      this.filteredValues = value.filter(
        (data: any) => data.status === 'D' && data.sale_type === 'gstinvoice'
      );
    } else if ($event.index === 1) {
      this.filteredValues = value.filter((data: any) => data.status === 'C');
    }

    this.calculateSumTotals();
    this._cdr.markForCheck();
  }

  calculateSumTotals() {
    this.sumTotalValue = 0.0;
    this.sumNumItems = 0;

    this.sumTotalValue = this.filteredValues
      .map((item) => {
        return item.net_total;
      })
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
      .toFixed(2);

    this.sumNumItems = this.filteredValues
      .map((item) => {
        return item.no_of_items;
      })
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }

  async editCompletedSalesConfirm(item) {
    this._router.navigateByUrl(`/home/sales/edit/${item.id}/TI`);
  }

  // async editCompletedSalesConfirm(item) {
  // 	const alert = await this.alertController.create({
  // 		header: 'Confirm!',
  // 		message: 'Editing completed sales, Are you sure?',
  // 		buttons: [
  // 			{
  // 				text: 'Cancel',
  // 				role: 'cancel',
  // 				cssClass: 'secondary',
  // 				handler: (blah) => {
  // 					console.log('Confirm Cancel: blah');
  // 				},
  // 			},
  // 			{
  // 				text: 'Go to sales screen',
  // 				handler: () => {
  // 					console.log('Confirm Okay');

  // 					this._router.navigateByUrl(`/home/sales/edit/${item.id}/TI`);
  // 				},
  // 			},
  // 		],
  // 	});

  // 	await alert.present();
  // }

  openDialog(row): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '50%';
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

  salesReturn(row): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    dialogConfig.height = '100%';
    dialogConfig.data = row;
    dialogConfig.position = { top: '0', right: '0' };

    const dialogRef = this._dialog.open(
      SalesReturnDialogComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        // throw success alert
        this.presentAlert('Return Recorded succcessfully!');
      }
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

  async exportCompletedSalesToExcel() {
    this.arr = [];
    const fileName = 'Completed_Sale_Reports.xlsx';

    this.arr = await lastValueFrom(this.fullfilledSales$);

    let reportData = JSON.parse(JSON.stringify(this.arr));

    reportData.forEach((e) => {
      e['Customer Name'] = e['customer_name'];
      delete e['customer_name'];

      e['Invoice #'] = e['invoice_no'];
      delete e['invoice_no'];

      e['Invoice Date'] = e['invoice_date'];
      delete e['invoice_date'];

      e['Sale Type'] = e['sale_type'];
      delete e['sale_type'];

      e['Total Qty'] = e['total_qty'];
      delete e['total_qty'];

      e['# of Items'] = e['no_of_items'];
      delete e['no_of_items'];

      e['Taxable Value'] = e['taxable_value'];
      delete e['taxable_value'];

      e['CGST'] = e['cgst'];
      delete e['cgst'];

      e['SGST'] = e['sgst'];
      delete e['sgst'];

      e['IGST'] = e['igst'];
      delete e['igst'];

      e['IGST'] = e['igst'];
      delete e['igst'];

      e['Total Value'] = e['total_value'];
      delete e['total_value'];

      e['Net Total'] = e['net_total'];
      delete e['net_total'];

      e['Sale Date Time'] = e['sale_datetime'];
      delete e['sale_datetime'];

      delete e['id'];
      delete e['center_id'];
      delete e['customer_id'];
      delete e['lr_no'];
      delete e['lr_date'];
      delete e['received_date'];
      delete e['order_no'];
      delete e['order_date'];
      delete e['transport_charges'];

      delete e['unloading_charges'];
      delete e['misc_charges'];
      delete e['status'];
      delete e['revision'];
      delete e['tax_applicable'];
      delete e['stock_issue_ref'];
      delete e['stock_issue_date_ref'];
      delete e['roundoff'];
      delete e['retail_customer_name'];
      delete e['retail_customer_address'];
      delete e['no_of_boxes'];
    });
    this.arr.splice(0, 1);

    const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);
    const wb1: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');

    //then add ur Title txt
    xlsx.utils.sheet_add_json(
      wb1.Sheets.sheet1,
      [
        {
          header: 'Completed Sale Reports',
          fromdate: `From: ${moment(this.submitForm.value.fromdate).format(
            'DD/MM/YYYY'
          )}`,
          todate: `To: ${moment(this.submitForm.value.todate).format(
            'DD/MM/YYYY'
          )}`,
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
    });

    xlsx.writeFile(wb1, fileName);
  }

  async exportDraftSalesToExcel() {
    this.arr = [];
    const fileName = 'Draft_Sale_Reports.xlsx';

    this.arr = await lastValueFrom(this.draftSales$);

    let reportData = JSON.parse(JSON.stringify(this.arr));

    reportData.forEach((e) => {
      e['Customer Name'] = e['customer_name'];
      delete e['customer_name'];

      e['Invoice #'] = e['invoice_no'];
      delete e['invoice_no'];

      e['Invoice Date'] = e['invoice_date'];
      delete e['invoice_date'];

      e['Sale Type'] = e['sale_type'];
      delete e['sale_type'];

      e['Total Qty'] = e['total_qty'];
      delete e['total_qty'];

      e['# of Items'] = e['no_of_items'];
      delete e['no_of_items'];

      e['Taxable Value'] = e['taxable_value'];
      delete e['taxable_value'];

      e['CGST'] = e['cgst'];
      delete e['cgst'];

      e['SGST'] = e['sgst'];
      delete e['sgst'];

      e['IGST'] = e['igst'];
      delete e['igst'];

      e['IGST'] = e['igst'];
      delete e['igst'];

      e['Total Value'] = e['total_value'];
      delete e['total_value'];

      e['Net Total'] = e['net_total'];
      delete e['net_total'];

      e['Sale Date Time'] = e['sale_datetime'];
      delete e['sale_datetime'];

      delete e['id'];
      delete e['center_id'];
      delete e['customer_id'];
      delete e['lr_no'];
      delete e['lr_date'];
      delete e['received_date'];
      delete e['order_no'];
      delete e['order_date'];
      delete e['transport_charges'];

      delete e['unloading_charges'];
      delete e['misc_charges'];
      delete e['status'];
      delete e['revision'];
      delete e['tax_applicable'];
      delete e['roundoff'];
      delete e['retail_customer_name'];
      delete e['retail_customer_address'];

      delete e['no_of_boxes'];
    });
    this.arr.splice(0, 1);

    const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);
    const wb1: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');

    //then add ur Title txt
    xlsx.utils.sheet_add_json(
      wb1.Sheets.sheet1,
      [
        {
          header: 'Draft Sale Reports',
          fromdate: `From: ${moment(this.submitForm.value.fromdate).format(
            'DD/MM/YYYY'
          )}`,
          todate: `To: ${moment(this.submitForm.value.todate).format(
            'DD/MM/YYYY'
          )}`,
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
    });

    xlsx.writeFile(wb1, fileName);
  }

  openDialog1(): void {
    const rect = this.clist.nativeElement.getBoundingClientRect();
    console.log('zzz' + rect.left);

    const dialogRef = this._dialog1.open(SearchInvoicenoComponent, {
      width: '250px',
      data: { name: this.name, animal: this.animal },

      position: { left: `${rect.left}px`, top: `${rect.bottom - 50}px` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }
}
