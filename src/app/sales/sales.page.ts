import { Component, ChangeDetectorRef, ViewChild, ElementRef, ViewChildren, QueryList, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { ModalController, PickerController, AlertController } from '@ionic/angular';

import { CommonApiService } from '../services/common-api.service';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray, FormGroupDirective } from '@angular/forms';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { CurrencyPadComponent } from '../components/currency-pad/currency-pad.component';

import { AuthenticationService } from '../services/authentication.service';
import { ChangeTaxComponent } from '../components/change-tax/change-tax.component';
import { ChangeMrpComponent } from '../components/change-mrp/change-mrp.component';
import { Route, ActivatedRoute, Router } from '@angular/router';
import { NullToQuotePipe } from '../util/pipes/null-quote.pipe';
import { filter, tap, debounceTime, switchMap, startWith } from 'rxjs/operators';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';

import { SaleApiService } from '../services/sale-api.service';

import { InvoiceSuccessComponent } from '../components/invoice-success/invoice-success.component';

import { Customer } from 'src/app/models/Customer';
import { Product } from '../models/Product';
import { empty } from 'rxjs';
import { RequireMatch } from '../util/directives/requireMatch';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { IonContent } from '@ionic/angular';
import { CustomerViewDialogComponent } from '../components/customers/customer-view-dialog/customer-view-dialog.component';
import { CustomerAddDialogComponent } from '../components/customers/customer-add-dialog/customer-add-dialog.component';
import { ConvertToSaleDialogComponent } from '../components/convert-to-sale-dialog/convert-to-sale-dialog.component';
import { Observable } from 'rxjs';
import { User } from '../models/User';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductAddDialogComponent } from '../components/products/product-add-dialog/product-add-dialog.component';
import { SuccessMessageDialogComponent } from '../components/success-message-dialog/success-message-dialog.component';

import { InventoryReportsDialogComponent } from '../components/reports/inventory-reports-dialog/inventory-reports-dialog.component';
import { ManualInvoiceNumberDialogComponent } from '../components/sales/manual-invoice-number-dialog/manual-invoice-number-dialog.component';

@Component({
	selector: 'app-sales',
	templateUrl: './sales.page.html',
	styleUrls: ['./sales.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPage {
	breadmenu = 'New Sale';

	listArr = [];

	total = '0.00';

	customer_state_code: any;
	center_state_code: any;
	i_gst: any;
	customerdata: any;

	submitForm: FormGroup;

	customername: string = '';
	customernameprint: string = '';

	no_of_boxes: any;

	selNoOfBoxes: any;
	igst: any;
	cgst: any;
	sgst: any;

	igstTotal = '0.00';
	cgstTotal = '0.00';
	sgstTotal = '0.00';

	tax_percentage: any;
	taxable_value: any;

	removeRowArr = [];

	deletedRowArr = [];

	showDelIcon = false;
	singleRowSelected = false;
	salesid: any;
	rawSalesData: any;

	maxDate = new Date();
	maxOrderDate = new Date();

	editCompletedSales: any;

	cust_discount_prcnt: any;
	cust_discount_type: any;
	mode: string;
	id: string;
	saletype: string;

	testTotal: any;
	invoiceid: any;
	final_invoice_no: any;
	invoicedate = new Date();

	isLoading = false;
	isCLoading = false;

	iscustomerselected = true;

	lineItemData: any;
	selInvType: any;

	orig_selInvType: any;

	stock_issue_date_ref: any;
	stock_issue_ref: any;
	clicked = false;

	selected_description = '';
	selected_mrp = '';

	isRetailCustomer = 'N';

	@ViewChild('orderno', { static: false }) orderNoEl: ElementRef;
	@ViewChildren('myCheckbox') private myCheckboxes: QueryList<any>;

	@ViewChild('newrow', { static: true }) newrow: any;

	// TAB navigation for customer list
	@ViewChild('typehead1', { read: MatAutocompleteTrigger })
	autoTrigger1: MatAutocompleteTrigger;

	@ViewChild(FormGroupDirective) formRef: FormGroupDirective;

	@ViewChild('typehead2', { static: false, read: MatAutocompleteTrigger })
	autoTrigger2: MatAutocompleteTrigger;
	@ViewChild('plist', { static: true }) plist: any;
	@ViewChild('clist', { static: true }) clist: any;

	@ViewChild('qty', { static: true }) qty: any;
	@ViewChildren('para') paras: any;
	paraElements: any;

	customer_lis: Customer[];
	product_lis: Product[];

	userdata$: Observable<User>;
	userdata: any;

	@ViewChild(IonContent, { static: false }) content: IonContent;

	question = '+ Add Customer"';
	//ready = 0; // flag check - centerid (localstorage) & customerid (param)

	// 3 Entry Ways. Via (i)Enquiry to Sale (ii) draft/completed Sale (iii) New Sale
	// (i && iii) - ignore customerchange flag, if (ii) process customer change flag
	// onload store customer id & check during submit. Handling Customer change for draft/completed sale
	orig_customerid: string;
	isFreshSale = false;
	fromEnquiry: any;

	constructor(
		private _modalcontroller: ModalController,
		public dialog: MatDialog,
		public alertController: AlertController,
		private _router: Router,
		private _route: ActivatedRoute,
		private _dialog: MatDialog,
		private _snackBar: MatSnackBar,
		private _authservice: AuthenticationService,
		private _saleApiService: SaleApiService,
		private _commonApiService: CommonApiService,
		private _fb: FormBuilder,
		private spinner: NgxSpinnerService,
		private _cdr: ChangeDetectorRef,
	) {
		this.userdata$ = this._authservice.currentUser;
		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this.userdata = data;

			//this.ready = 1;

			// data change
			this._route.data.subscribe((data) => {
				this.basicinit();

				this.selInvType = 'gstinvoice';
				this.listArr = [];
				this.cancel();
				this.rawSalesData = data['rawsalesdata'];
			});
			// param change
			this._route.params.subscribe((params) => {
				this.submitForm.patchValue({
					center_id: this.userdata.center_id,
				});

				this.clicked = false;

				this.id = params['id'];
				this.mode = params['mode'];
				this.saletype = params['saletype'];

				if (this.saletype === 'SI') {
					this.selInvType = 'stockissue';
					this._authservice.setCurrentMenu('Stock Issue');
				} else if (this.saletype === 'TI') {
					this.selInvType = 'gstinvoice';
					this._authservice.setCurrentMenu('Sale Orders');
				}

				if (this.userdata !== undefined) {
					this.initialize();
					this.submitForm.patchValue({
						center_id: this.userdata.center_id,
					});

					if (this.saletype === 'SI') {
						this.submitForm.patchValue({
							invoicetype: 'stockissue',
						});
					} else {
						this.submitForm.patchValue({
							invoicetype: 'gstinvoice',
						});
					}
				}
			});

			this._cdr.markForCheck();
		});
	}

	basicinit() {
		this.submitForm = this._fb.group({
			center_id: [null],
			salesid: new FormControl(''),

			invoiceno: [null],
			invoicedate: new FormControl(this.invoicedate, Validators.required),
			orderno: new FormControl(''),
			orderdate: new FormControl(''),
			lrno: new FormControl(''),
			lrdate: new FormControl(''),
			noofboxes: new FormControl(0),
			orderrcvddt: new FormControl(''),
			noofitems: [0],
			totalqty: [0],
			value: new FormControl(0),
			totalvalue: new FormControl(0),
			igst: new FormControl(0),
			cgst: [0],
			sgst: new FormControl(0),
			transport_charges: [0],
			unloading_charges: [0],
			misc_charges: [0],
			net_total: new FormControl(0),
			taxable_value: new FormControl(0),
			status: new FormControl(''),
			enqref: [0],
			revision: [0],
			invoicetype: ['gstinvoice', [Validators.required]],

			customerctrl: [null, [Validators.required, RequireMatch]],
			productctrl: [null, [RequireMatch]],
			tempdesc: [''],
			tempmrp: [0],
			tempqty: ['1', [Validators.required, Validators.max(1000), Validators.min(1), Validators.pattern(/\-?\d*\.?\d{1,2}/)]],

			productarr: new FormControl(null),
			roundoff: [0],
			retail_customer_name: ['Cash Sale'],
			retail_customer_address: [''],
			retail_customer_phone: [''],
			hasCustomerChange: [''],
			old_customer_id: [''],
			inv_gen_mode: ['A'],
		});
	}

	initialize() {
		this.init();

		if (this.id === '0') {
			// id ===0 means fresh sale
			this.isFreshSale = true;
			this.getInvoiceSequence(this.userdata.center_id, 'gstinvoice');
		}

		// comes from MOVE TO SALE: Enquiry -> sale process
		if (this.mode === 'enquiry') {
			this.getInvoiceSequence(this.userdata.center_id, 'gstinvoice');
			// id refers to enquiry id, also recorded as orderno in sales table
			this.submitForm.patchValue({
				enqref: this.id,
				orderno: this.id,
			});

			this.fromEnquiry = true;

			this.spinner.show();
			this._commonApiService.getCustomerData(this.id).subscribe((custData: any) => {
				this.customerdata = custData[0];

				this.submitForm.patchValue({
					customerctrl: custData[0],
				});

				this.customername = custData[0].name;
				this.customernameprint = custData[0].name;
				// record orignal customer id from enquiry, can ignore while submitting
				// as there will be no reference in ledger/payment tables
				this.orig_customerid = custData[0].id;
				this.iscustomerselected = true;

				this.setTaxLabel(custData[0].code);

				let invdt = moment(this.submitForm.value.invoicedate).format('DD-MM-YYYY');

				// prod details
				this._commonApiService.getEnquiredProductData(this.userdata.center_id, this.customerdata.id, this.id, invdt).subscribe((prodData: any) => {
					this.spinner.hide();
					let proddata = prodData;

					this.submitForm.patchValue({
						orderdate:
							proddata[0].enquiry_date === ''
								? ''
								: new Date(new NullToQuotePipe().transform(proddata[0].enquiry_date).replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),
						//  orderdate: (proddata[0].enquiry_date !== '' || proddata[0].enquiry_date !== undefined) ? proddata[0].enquiry_date : ''
					});

					proddata.forEach((element) => {
						this.processItems(element, 'preload');
					});

					this._cdr.markForCheck();
				});

				this._cdr.markForCheck();
			});
		}

		// raw sales data : which comes from regular sale screen and not from enquiry screen
		this.buildRawSaleData();
	}

	buildRawSaleData() {
		if (this.rawSalesData !== null && this.rawSalesData !== undefined) {
			if (this.rawSalesData[0] !== undefined) {
				if (this.rawSalesData[0].id !== 0) {
					if (this.rawSalesData[0].sale_type === 'gstinvoice') {
						this.breadmenu = 'Modify Sale #';
					} else {
						this.breadmenu = 'Modify Stock Issue #';
					}

					this.selInvType = this.rawSalesData[0].sale_type;
					this.orig_selInvType = this.rawSalesData[0].sale_type;
					this.stock_issue_ref = this.rawSalesData[0].stock_issue_ref;
					this.stock_issue_date_ref = this.rawSalesData[0].stock_issue_date_ref;
					this.orig_customerid = this.rawSalesData[0].customer_id; //capture customer id while loading

					this.submitForm.patchValue({
						salesid: this.rawSalesData[0].id,
						invoiceno: this.rawSalesData[0].invoice_no,
						invoicetype: this.rawSalesData[0].sale_type,
						invoicedate: new Date(new NullToQuotePipe().transform(this.rawSalesData[0].invoice_date).replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),

						orderdate:
							this.rawSalesData[0].order_date === ''
								? ''
								: new Date(new NullToQuotePipe().transform(this.rawSalesData[0].order_date).replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),

						lrno: this.rawSalesData[0].lr_no,

						lrdate:
							this.rawSalesData[0].lr_date === ''
								? ''
								: new Date(new NullToQuotePipe().transform(this.rawSalesData[0].lr_date).replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),
						orderno: this.rawSalesData[0].order_no,
						noofboxes: this.rawSalesData[0].no_of_boxes,

						orderrcvddt:
							this.rawSalesData[0].received_date === '' || this.rawSalesData[0].received_date === null
								? ''
								: new Date(new NullToQuotePipe().transform(this.rawSalesData[0].received_date).replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),

						noofitems: this.rawSalesData[0].no_of_items,
						totalqty: this.rawSalesData[0].total_qty,
						value: this.rawSalesData[0].total_value,
						totalvalue: this.rawSalesData[0].total_value,
						igst: this.rawSalesData[0].igst,
						cgst: this.rawSalesData[0].cgst,
						sgst: this.rawSalesData[0].sgst,
						transport_charges: this.rawSalesData[0].transport_charges,
						unloading_charges: this.rawSalesData[0].unloading_charges,
						misc_charges: this.rawSalesData[0].misc_charges,
						net_total: this.rawSalesData[0].net_total,
						taxable_value: this.rawSalesData[0].taxable_value,
						status: this.rawSalesData[0].status,
						revision: this.rawSalesData[0].revision,
						retail_customer_name: this.rawSalesData[0].retail_customer_name,
						retail_customer_address: this.rawSalesData[0].retail_customer_address,
						retail_customer_phone: this.rawSalesData[0].retail_customer_phone,
						inv_gen_mode: this.rawSalesData[0].inv_gen_mode,
					});

					if (this.rawSalesData[0].status === 'C' || this.rawSalesData[0].status === 'D') {
						this.editCompletedSales = true;
					}

					this._cdr.markForCheck();

					this._commonApiService.getCustomerDetails(this.userdata.center_id, this.rawSalesData[0].customer_id).subscribe((custData: any) => {
						this.customerdata = custData[0];

						this.submitForm.patchValue({
							customerctrl: custData[0],
						});

						this.customername = custData[0].name;
						this.customernameprint = custData[0].name;
						this.iscustomerselected = true;

						this.setTaxLabel(custData[0].code);

						if (this.customername === 'Walk In') {
							this.isRetailCustomer = 'Y';
						} else {
							this.isRetailCustomer = 'N';
						}

						this._cdr.markForCheck();
					});

					this._commonApiService.saleDetails(this.rawSalesData[0].id).subscribe((saleData: any) => {
						let sData = saleData;

						sData.forEach((element) => {
							this.processItems(element, 'preload');
						});
					});

					this._cdr.markForCheck();
				}
			}
		}
	}

	init() {
		this.clearInput();
		this.clearProdInput();
		this.searchCustomers();
		this.searchProducts();

		this._cdr.markForCheck();
	}

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
				}),
			)

			.subscribe((data: any) => {
				this.isCLoading = false;
				this.customer_lis = data.body;

				this._cdr.markForCheck();
			});
	}

	processItems(temp, type) {
		this.setTaxSegment(temp.taxrate);
		let subtotal = 0;
		let taxableval = 0;
		let totalval = 0;
		let discval = 0;

		let sid = '';
		if (this.rawSalesData !== null && this.rawSalesData !== undefined) {
			if (this.rawSalesData[0] !== undefined) {
				sid = new NullToQuotePipe().transform(this.rawSalesData[0].id);
			}
		}

		let oldval = 0;

		if (new NullToQuotePipe().transform(temp.id) !== '') {
			oldval = temp.qty;
		}

		// else part is when navigating via edit sale,
		// when disc_info present its fresh adding products, if not, take it from saledetail tbl
		if (temp.disc_info !== undefined && temp.disc_info !== null) {
			let disc_info = temp.disc_info;
			this.cust_discount_type = disc_info.substring(disc_info.indexOf('~') + 1);
			this.cust_discount_prcnt = disc_info.substring(0, disc_info.indexOf('~'));
		} else {
			this.cust_discount_type = temp.disc_type;
			this.cust_discount_prcnt = temp.disc_percent;
		}

		if (this.cust_discount_type === 'NET') {
			subtotal = temp.qty * temp.mrp;
			taxableval = (temp.qty * temp.mrp * (100 - this.cust_discount_prcnt)) / (100 + temp.taxrate);
			discval = temp.qty * temp.mrp * (this.cust_discount_prcnt / 100);

			totalval = (temp.qty * temp.mrp * (100 - this.cust_discount_prcnt)) / 100;
		} else if (this.cust_discount_type === 'GROSS') {
			subtotal = temp.qty * temp.mrp;
			taxableval = (temp.qty * temp.mrp * (100 - this.cust_discount_prcnt)) / 100;
			discval = (temp.qty * temp.mrp * this.cust_discount_prcnt) / 100;
			totalval = ((temp.qty * temp.mrp * (100 - this.cust_discount_prcnt)) / 100) * (1 + temp.taxrate / 100);
		}

		// from product tbl
		this.listArr.push({
			sales_id: sid,
			sale_det_id: new NullToQuotePipe().transform(temp.id),
			checkbox: false,
			product_id: temp.product_id,
			product_code: temp.product_code,
			product_desc: temp.description,
			qty: temp.qty,
			packetsize: temp.packetsize,
			unit_price: temp.unit_price,
			mrp: temp.mrp,
			mrp_change_flag: 'N',
			taxrate: temp.taxrate,

			sub_total: subtotal.toFixed(2),
			taxable_value: taxableval.toFixed(2),
			disc_value: discval.toFixed(2),
			disc_percent: this.cust_discount_prcnt,
			disc_type: this.cust_discount_type,
			total_value: totalval.toFixed(2),
			tax_value: (totalval - taxableval).toFixed(2),

			igst: this.igst,
			cgst: this.cgst,
			sgst: this.sgst,
			old_val: oldval,
			stock_pk: temp.stock_pk,
			del_flag: 'N',
			margin: totalval / temp.qty - temp.unit_price < 0 ? 'marginNeg' : '',
			qtyerror: '',
			discerror: '',
		});

		const tempArr = this.listArr.map((arrItem) => {
			return parseFloat(arrItem.total_value);
		});

		const tempArrCostPrice = this.listArr.map((arr) => {
			return parseFloat(arr.unit_price);
		});

		this.total = tempArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0).toFixed(2);
		console.log('TCL: PurchasePage -> showAddProductComp -> this.total', this.total);

		this.taxable_value = tempArrCostPrice.reduce((accumulator, currentValue) => accumulator + currentValue, 0).toFixed(2);

		this.submitForm.patchValue({
			taxable_value: this.taxable_value,
		});

		this.sumTotalTax();

		if (type === 'loadingnow') {
			let v1 = 240 + this.listArr.length * 70 + 70;
			this.ScrollToPoint(0, v1);
		} else {
			this.ScrollToTop();
		}

		this._cdr.markForCheck();
	}

	ScrollToPoint(X, Y) {
		this.content.scrollToPoint(X, Y, 300);
	}

	clearInput() {
		this.submitForm.patchValue({
			customerctrl: null,
		});

		this.iscustomerselected = false;

		this._cdr.markForCheck();
	}

	async handleCustomerChange() {
		this.clist && this.clist.nativeElement.focus();
		const alert = await this.alertController.create({
			header: 'Confirm!',
			message: 'Customer change. Do you want to proceed? Revisit customer discount for accuracy',
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

						this.clearInput();
					},
				},
			],
		});

		await alert.present();
	}

	sumTotalTax() {
		if (this.i_gst) {
			this.igstTotal = this.listArr
				.map((item) => {
					return +item.tax_value;
				}) // convert to number using +
				.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
				.toFixed(2);

			console.log('dines' + this.igstTotal);
			this.submitForm.patchValue({
				igst: this.igstTotal,
				cgst: 0,
				sgst: 0,
			});
		} else {
			this.cgstTotal = this.listArr
				.map((item) => {
					return item.tax_value / 2;
				})
				.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
				.toFixed(2);

			this.sgstTotal = this.listArr
				.map((item) => {
					return item.tax_value / 2;
				})
				.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
				.toFixed(2);
			console.log('cgstTotal' + this.cgstTotal);
			console.log('sgstTotal' + this.sgstTotal);

			this.submitForm.patchValue({
				cgst: this.cgstTotal,
				sgst: this.sgstTotal,
				igst: 0,
			});
		}
		this._cdr.markForCheck();
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.clist && this.clist.nativeElement.focus();

			if (this.mode === 'edit' && this.id !== '0') {
				this.plist && this.plist.nativeElement.focus();
				this.openSnackBar('WARNING: Editing completed sales!', '', 'mat-warn');
			}

			this._cdr.detectChanges();
		}, 100);

		this.autoTrigger1 &&
			this.autoTrigger1.panelClosingActions.subscribe((x) => {
				if (this.autoTrigger1.activeOption && this.autoTrigger1.activeOption.value !== undefined) {
					this.submitForm.patchValue({
						customerctrl: this.autoTrigger1.activeOption.value,
					});
					this.setCustomerInfo(this.autoTrigger1.activeOption.value, 'tab');
				}
			});

		this.autoTrigger2 &&
			this.autoTrigger2.panelClosingActions.subscribe((x) => {
				if (this.autoTrigger2.activeOption && this.autoTrigger2.activeOption.value !== undefined) {
					this.submitForm.patchValue({
						productctrl: this.autoTrigger2.activeOption.value,
					});

					this.setItemDesc(this.autoTrigger2.activeOption.value, 'tab');
				}
			});

		setTimeout(() => {
			console.log('inside set time para');
			this.paraElements = this.paras.map((para) => {
				console.log('Paras: ', para.nativeElement);
				return para.nativeElement;
			});
		}, 100);
	}

	deleteProduct(idx) {
		if (this.listArr[idx].sale_det_id !== '' && this.listArr[idx].sale_det_id !== undefined) {
			this.listArr[idx].del_flag = 'Y';
			this.deletedRowArr.push(this.listArr[idx]);
		}
		this.listArr.splice(idx, 1);
		this.removeRowArr = this.removeRowArr.filter((e) => e !== idx);

		this.delIconStatus();
		this.checkIsSingleRow();
		this.calc();

		this._cdr.markForCheck();
	}

	checkIsSingleRow() {
		if (this.removeRowArr.length === 1) {
			this.singleRowSelected = true;
		} else {
			this.singleRowSelected = false;
		}
	}

	setTaxSegment(taxrate: number) {
		if (this.i_gst) {
			this.i_gst = true;
			this.igst = taxrate;
			this.cgst = 0;
			this.sgst = 0;
		} else {
			this.i_gst = false;
			this.igst = 0;
			this.cgst = taxrate / 2;
			this.sgst = taxrate / 2;
		}
	}

	setTaxLabel(customer_state_code) {
		if (customer_state_code !== this.userdata.code) {
			this.i_gst = true;
		} else {
			this.i_gst = false;
		}
	}

	validateForms() {
		if (this.submitForm.value.invoicedate == null) {
			this.presentAlert('Enter Invoice Date!');
			return false;
		}

		if (this.mode === 'enquiry') {
			if (this.submitForm.value.invoicedate !== null && this.submitForm.value.orderdate !== '' && this.submitForm.value.orderdate != null) {
				if (this.submitForm.value.orderno === '' && this.submitForm.value.orderdate != null) {
					this.orderNoEl && this.orderNoEl.nativeElement.focus();
					this.presentAlert('Enquiry Date without Enquiry # not allowed');
					return false;
				}

				if (moment(this.submitForm.value.orderdate).format('DD-MM-YYYY') > moment(this.submitForm.value.invoicedate).format('DD-MM-YYYY')) {
					this.presentAlert('Invoice date should be after Enquiry date');
					return false;
				}
			}
		}

		if (this.submitForm.value.invoicedate !== null && this.submitForm.value.lrdate !== '' && this.submitForm.value.lrdate !== null) {
			if (this.submitForm.value.lrno === '') {
				this.presentAlert('Lr Date without Lr # not allowed');
				return false;
			}
			if (this.submitForm.value.lrdate < this.submitForm.value.invoicedate) {
				this.presentAlert('Lr date should be after Invoice date');
				return false;
			}
		}

		return true;
	}

	checkerrors() {
		return this.listArr.some((e) => {
			if (e.qtyerror !== '') {
				return true;
			}
		});
	}

	checkdiscerrors() {
		return this.listArr.some((e) => {
			if (e.discerror !== '') {
				return true;
			}
		});
	}

	public findInvalidControls() {
		const invalid = [];
		const controls = this.submitForm.controls;
		for (const name in controls) {
			if (controls[name].invalid) {
				invalid.push(name);
			}
		}
		return invalid;
	}

	onSubmit(action, subaction) {
		debugger;
		if (this.listArr.length == 0) {
			return this.presentAlert('No products added to save!');
		}
		debugger;
		if (!this.submitForm.valid) {
			// DnD this helps in finding invalid controls name, used for debugging
			console.log('invalid field ' + this.findInvalidControls());
			this.presentAlert('Validation Failure Error!');
			return false;
		}

		if (this.listArr.length > 0) {
			if (this.checkerrors()) {
				return this.presentAlert('Fix errors in products quantity !');
			}

			if (this.checkdiscerrors()) {
				return this.presentAlert('Fix errors in products discount !');
			}

			if (this.validateForms()) {
				this.submitForm.patchValue({
					productarr: this.listArr,
				});

				this.submitForm.patchValue({
					noofitems: this.listArr.length,
				});

				this.submitForm.patchValue({
					customerctrl: this.customerdata,
				});

				const tot_qty_check_Arr = this.listArr.map((arrItem) => {
					return parseFloat(arrItem.qty);
				});

				let tmpTotQty = tot_qty_check_Arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0).toFixed(2);

				this.submitForm.patchValue({
					totalqty: tmpTotQty,
				});

				this.submitForm.patchValue({
					totalvalue: this.total,
				});

				this.submitForm.patchValue({
					net_total: this.getNetTotal('rounding'),
					roundoff: (this.getNetTotal('rounding') - this.getNetTotal('withoutrounding')).toFixed(2),
				});

				if (action === 'add') {
					this.mainSubmit('add', 'back');
				} else if (action === 'draft') {
					if (subaction === 'continue') {
						this.mainSubmit('draft', 'stay');
					} else {
						this.mainSubmit('draft', 'back');
					}
				}
			}
		}
	}

	getNetTotal(param) {
		let tmp =
			parseFloat(this.total) +
			parseFloat(this.submitForm.value.transport_charges || 0) +
			parseFloat(this.submitForm.value.unloading_charges || 0) +
			parseFloat(this.submitForm.value.misc_charges || 0);
		if (param === 'rounding') {
			return Math.round(+tmp.toFixed(2));
		} else if (param === 'withoutrounding') {
			return +tmp.toFixed(2);
		}
	}

	async presentAlert(msg: string) {
		const alert = await this.alertController.create({
			header: 'Alert',

			message: msg,
			buttons: ['OK'],
		});

		await alert.present();
	}

	invoiceSuccess(invoice_id) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '600px';

		dialogConfig.data = { customer_name: this.customernameprint, id: this.invoiceid, invoice_no: this.final_invoice_no };

		const dialogRef = this.dialog.open(InvoiceSuccessComponent, dialogConfig);

		dialogRef.afterClosed();
	}

	convertToInvoiceSuccess(invoice_id, invoice_date) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '400px';

		dialogConfig.data = { invoiceid: invoice_id, invoicedate: invoice_date };

		const dialogRef = this.dialog.open(ConvertToSaleDialogComponent, dialogConfig);

		dialogRef.afterClosed().subscribe((data) => {
			console.log('The dialog was closed');
			this._router.navigateByUrl('/home/search-sales');
		});
	}

	openNumberPad(field) {
		const dialogRef = this.dialog.open(CurrencyPadComponent, {
			width: '400px',
		});

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap((val) => {
					this.submitForm.controls[field].setValue(val);
					this._cdr.markForCheck();
				}),
			)
			.subscribe();
	}

	handleDiscountChange($event, idx) {
		let discVal = $event.target.value;

		if (+discVal <= 100 && discVal !== '') {
			this.listArr[idx].disc_percent = $event.target.value;

			this.qtyChange(idx);
			this.listArr[idx].discerror = '';
			this._cdr.detectChanges();
		} else {
			this.listArr[idx].discerror = 'error';
			this._cdr.detectChanges();
		}
	}

	handleQtyChange($event, idx) {
		let qtyval = $event.target.value;

		if (qtyval > 0) {
			this.listArr[idx].qty = $event.target.value;
			this.qtyChange(idx);
			this.listArr[idx].qtyerror = '';
			this._cdr.detectChanges();
		} else {
			this.listArr[idx].qtyerror = 'error';
			this._cdr.detectChanges();
		}
	}

	qtyChange(idx) {
		if (this.cust_discount_type === 'NET') {
			this.listArr[idx].sub_total = (this.listArr[idx].qty * this.listArr[idx].mrp).toFixed(2);

			this.listArr[idx].total_value = ((this.listArr[idx].qty * this.listArr[idx].mrp * (100 - this.listArr[idx].disc_percent)) / 100).toFixed(2);

			this.listArr[idx].disc_value = ((this.listArr[idx].qty * this.listArr[idx].mrp * this.listArr[idx].disc_percent) / 100).toFixed(2);

			this.listArr[idx].taxable_value = (
				(this.listArr[idx].qty * this.listArr[idx].mrp * (100 - this.listArr[idx].disc_percent)) /
				(100 + this.listArr[idx].taxrate)
			).toFixed(2);
			this.listArr[idx].tax_value = (this.listArr[idx].total_value - this.listArr[idx].taxable_value).toFixed(2);
		} else {
			this.listArr[idx].sub_total = (this.listArr[idx].qty * this.listArr[idx].mrp).toFixed(2);
			this.listArr[idx].total_value = (
				((this.listArr[idx].qty * this.listArr[idx].mrp * (100 - this.listArr[idx].disc_percent)) / 100) *
				(1 + this.listArr[idx].taxrate / 100)
			).toFixed(2);
			this.listArr[idx].disc_value = (
				((this.listArr[idx].qty * this.listArr[idx].mrp * this.listArr[idx].disc_percent) / 100) *
				(1 + this.listArr[idx].taxrate / 100)
			).toFixed(2);
			this.listArr[idx].taxable_value = ((this.listArr[idx].qty * this.listArr[idx].mrp * (100 - this.listArr[idx].disc_percent)) / 100).toFixed(2);
			this.listArr[idx].tax_value = (this.listArr[idx].total_value - this.listArr[idx].taxable_value).toFixed(2);
		}

		this.listArr[idx].margin = this.listArr[idx].total_value / this.listArr[idx].qty - this.listArr[idx].unit_price < 0 ? 'marginNeg' : '';

		this.calc();

		this._cdr.markForCheck();
	}

	calc() {
		const tempArr = this.listArr.map((arrItem) => {
			return parseFloat(arrItem.taxable_value) + parseFloat(arrItem.tax_value);
		});

		const tempArrCostPrice = this.listArr.map((arr) => {
			return parseFloat(arr.unit_price) * parseFloat(arr.qty);
		});

		this.total = tempArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0).toFixed(2);

		this.taxable_value = tempArrCostPrice.reduce((accumulator, currentValue) => accumulator + currentValue, 0).toFixed(2);

		this.submitForm.patchValue({
			taxable_value: this.taxable_value,
		});

		this.submitForm.patchValue({
			totalvalue: this.total,
		});

		this.sumTotalTax();
		this._cdr.markForCheck();
	}

	marginCheck(margin) {
		if (margin === 'marginNeg') {
			return 'marginneg';
		}
	}

	mainSubmit(action, navto) {
		this.executeDeletes();

		if (action === 'add') {
			this.submitForm.patchValue({
				status: 'C',
			});
		} else if (action === 'draft') {
			this.submitForm.patchValue({
				status: 'D',
			});
		}

		//main submit
		this.clicked = true; // disable all buttons after submission
		this._cdr.markForCheck();
		this.spinner.show();

		// Check if customer changed and set status
		// shoun't be fresh sale or movetosale(enquiry-sale)

		if (!this.isFreshSale && !this.fromEnquiry) {
			if (this.orig_customerid !== this.submitForm.value.customerctrl.id) {
				this.submitForm.patchValue({
					hasCustomerChange: 'YS',
					old_customer_id: this.orig_customerid,
				});
			}
		}

		// Main Submit to BE
		this._commonApiService.saveSaleOrder(this.submitForm.value).subscribe((data: any) => {
			this.spinner.hide();
			// console.log('saveSaleOrder ' + JSON.stringify(data));

			if (data.body.result === 'success') {
				this.invoiceid = data.body.id;
				this.final_invoice_no = data.body.invoiceno;

				// check
				// this.cancel();
				// this.formRef.resetForm();

				// reinit after successful insert
				//  this.getInvoiceSequence(this.userdata.center_id, "gstinvoice");

				this._cdr.markForCheck();
				if (action === 'add') {
					this.cancel();
					this.formRef.resetForm();
					this.invoiceSuccess(this.invoiceid);
					this.submitForm.patchValue({
						invoicedate: new Date(),
					});
					// invoice add dialog
				} else {
					// Save as Draft & continue
					//this.presentAlert('Saved to Draft!');
					this.openSnackBar('INFO: Saved to Draft!', '', 'mat-primary');
					this.clicked = false;

					this.id = data.body.id;
					this.mode = 'edit';
					this.listArr = [];
					this.submitForm.patchValue({
						invoiceno: data.body.invoiceno,
						salesid: data.body.id,
					});
					this._commonApiService.salesMasterData(data.body.id).subscribe((data) => {
						this.rawSalesData = data;
						this._cdr.markForCheck();
						this.buildRawSaleData();
					});
				}

				if (navto === 'back' && this.saletype === 'SI') {
					this.stockIssuesDashboard();
				} else if (navto === 'back' && this.saletype === 'TI') {
					this.salesDashboard();
				}
			} else {
				this.presentAlert('Error: Something went wrong Contact Admin!');
			}

			this._cdr.markForCheck();
		});
	}

	// Fn: to get & set invoiceno and invoice type
	getInvoiceSequence(centerid, invoicetype) {
		this._saleApiService.getNxtSaleInvoiceNo(centerid, invoicetype).subscribe((data: any) => {
			this.submitForm.patchValue({
				invoiceno: data[0].NxtInvNo,
				// invoicetype: invoicetype,
			});

			// this.selInvType = invoicetype;
			this._cdr.markForCheck();
		});
	}

	async presentCancelConfirm() {
		const alert = await this.alertController.create({
			header: 'Confirm!',
			message: 'Are you sure to leave the page?',
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
						// this.cancel();
						this._router.navigateByUrl('/home/search-sales');
					},
				},
			],
		});

		await alert.present();
	}

	async presentConvertSaleConfirm() {
		const alert = await this.alertController.create({
			header: 'Confirm!',
			message: 'This change cannot be rolled back. Are you sure?',
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

						this.convertToSale();
					},
				},
			],
		});

		await alert.present();
	}

	cancel() {
		this.customerdata = null;

		this.customername = '';
		this.iscustomerselected = false;
		this.editCompletedSales = false;
		this.listArr = [];

		this.total = '0.00';
		this.igstTotal = '0.00';
		this.cgstTotal = '0.00';
		this.sgstTotal = '0.00';

		this.customer_lis = null;
	}

	convertToSale() {
		// pass sale id and call backend
		// refresh the page with latest values (invoice # and inv type)

		this._commonApiService
			.convertToSale({
				center_id: this.userdata.center_id,
				sales_id: this.id,
				old_invoice_no: this.submitForm.value.invoiceno,
				old_stock_issued_date: this.submitForm.value.invoicedate,
				customer_id: this.submitForm.value.customerctrl.id,
				net_total: this.submitForm.value.net_total,
			})
			.subscribe((data: any) => {
				console.log('object');

				if (data.body.result === 'success') {
					this.convertToInvoiceSuccess(data.body.invoiceNo, moment().format('DD-MM-YYYY'));
				}
			});
	}

	checkedRow(idx: number) {
		if (!this.listArr[idx].checkbox) {
			this.listArr[idx].checkbox = true;
			this.removeRowArr.push(idx);
		} else if (this.listArr[idx].checkbox) {
			this.listArr[idx].checkbox = false;
			this.removeRowArr = this.removeRowArr.filter((e) => e !== idx);
		}
		this.delIconStatus();
		this.checkIsSingleRow();
	}

	delIconStatus() {
		if (this.removeRowArr.length > 0) {
			this.showDelIcon = true;
		} else {
			this.showDelIcon = false;
		}
	}

	onRemoveRows() {
		this.removeRowArr.sort(this.compare).reverse();
		this.removeRowArr.forEach((e) => {
			this.deleteProduct(e);
		});
	}

	compare(a: number, b: number) {
		return a - b;
	}

	executeDeletes() {
		this.deletedRowArr.sort().reverse();
		this.deletedRowArr.forEach((e) => {
			this.executeDeleteProduct(e);
		});
	}

	executeDeleteProduct(elem) {
		this._commonApiService
			.deleteSalesDetails({
				id: elem.sale_det_id,
				salesid: elem.sales_id,
				qty: elem.qty,
				product_id: elem.product_id,
				stock_id: elem.stock_pk,
				autidneeded: this.editCompletedSales,
				center_id: this.userdata.center_id,
				mrp: elem.mrp,
			})
			.subscribe((data: any) => {
				if (data.body.result === 'success') {
					console.log('object >>> execute delete product ...');
				} else {
					this.presentAlert('Error: Something went wrong Contact Admin!');
				}

				this._cdr.markForCheck();
			});

		this._cdr.markForCheck();
	}

	async editTax() {
		const modalTax = await this._modalcontroller.create({
			component: ChangeTaxComponent,
			componentProps: { pArry: this.listArr, rArry: this.removeRowArr },
			cssClass: 'tax-edit-modal',
		});

		// after permanent or tax change reload the igst,sgst,cgst as per new tax slab
		modalTax.onDidDismiss().then((result) => {
			console.log('The result:', result);

			if (result.data !== undefined) {
				let myCheckboxes = this.myCheckboxes.toArray();

				this.removeRowArr.forEach((idx) => {
					this.listArr[idx].taxrate = +result.data;

					if (this.igst) {
						this.listArr[idx].igst = +result.data;
					} else {
						this.listArr[idx].sgst = +result.data / 2;
						this.listArr[idx].cgst = +result.data / 2;
					}

					this.listArr[idx].checkbox = false;
					myCheckboxes[idx].checked = false;

					this.qtyChange(idx);
					this._cdr.markForCheck();
				});

				this.removeRowArr = [];

				this.delIconStatus();
				this.checkIsSingleRow();

				this._cdr.markForCheck();
			}
		});
		await modalTax.present();
	}

	async editMrp() {
		const modalTax = await this._modalcontroller.create({
			component: ChangeMrpComponent,
			componentProps: { pArry: this.listArr, rArry: this.removeRowArr },
			cssClass: 'tax-edit-modal',
		});

		modalTax.onDidDismiss().then((result) => {
			console.log('The result:', result);

			if (result.data !== undefined) {
				let myCheckboxes = this.myCheckboxes.toArray();

				this.removeRowArr.forEach((idx) => {
					this.listArr[idx].mrp = result.data;
					this.listArr[idx].checkbox = false;
					myCheckboxes[idx].checked = false;
					this.listArr[idx].mrp_change_flag = 'Y';

					this.qtyChange(idx);
					this._cdr.markForCheck();
				});

				this.removeRowArr = [];

				this.delIconStatus();
				this.checkIsSingleRow();

				this._cdr.markForCheck();
			}
		});
		await modalTax.present();
	}

	async presentDeleteConfirm() {
		const alert = await this.alertController.create({
			header: 'Confirm!',
			message: 'Are You sure to delete!!!',
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
						this.onRemoveRows();
					},
				},
			],
		});

		await alert.present();
	}

	invoiceDateSelected($event) {
		this.maxOrderDate = $event.target.value;
	}

	clearProdInput() {
		this.submitForm.patchValue({
			productctrl: null,
			tempdesc: null,
			tempmrp: 0,
			tempqty: 1,
		});
		this.product_lis = null;
		this.selected_description = '';
		this.selected_mrp = '';
		this._cdr.markForCheck();
	}

	async setItemDesc(event, from) {
		let onlyProductCodeArr = this.listArr.map((element) => {
			return element.product_code;
		});

		if (from === 'tab') {
			this.lineItemData = event;
		} else {
			this.lineItemData = event.option.value;
		}

		let isduplicate = onlyProductCodeArr.includes(this.lineItemData.product_code);
		let proceed = false;

		if (isduplicate) {
			var index = onlyProductCodeArr.indexOf(this.lineItemData.product_code);

			const alert = await this.alertController.create({
				header: 'Confirm!',
				message: `The Item already added ROW # (${index + 1}). Do you want to add again?`,
				buttons: [
					{
						text: 'Cancel',
						role: 'cancel',
						cssClass: 'secondary',
						handler: (blah) => {
							console.log('Confirm Cancel: blah');
							this.clearProdInput();
							this.plist && this.plist.nativeElement.focus();
							this.plist && this.plist.nativeElement.select();
						},
					},
					{
						text: 'Edit Item Row',

						cssClass: 'secondary',
						handler: (blah) => {
							//this.qty.nativeElement.focus();
							this.clearProdInput();
							debugger;

							setTimeout(() => {
								this.paraElements[index] && this.paraElements[index].focus();
								this.paraElements[index] && this.paraElements[index].select();

								//	this.qty && this.qty.nativeElement.focus();
								// this.qty && this.qty.nativeElement.select();
							}, 10);
						},
					},
					{
						text: 'Continue to Add',
						cssClass: 'primary',
						handler: () => {
							console.log('Confirm Okay');
							proceed = true;
							this.addLineItemData(event, from);
						},
					},
				],
			});

			await alert.present();
		} else {
			this.addLineItemData(event, from);
		}

		this._cdr.markForCheck();
	}

	// colorMe(index) {
	// 	console.log('Index: ', index);
	// 	this.paraElements[index].style.backgroundColor = '#5789D8';
	//   }

	addLineItemData(event, from) {
		if (from === 'tab') {
			this.submitForm.patchValue({
				tempdesc: event.description,
				tempqty: event.qty === 0 ? 1 : event.qty,
				tempmrp: event.mrp,
			});
			this.lineItemData = event;
			this.selected_description = event.description;
			this.selected_mrp = event.mrp;

			//this.qty && this.qty.nativeElement.focus();
		} else {
			this.submitForm.patchValue({
				tempdesc: event.option.value.description,
				tempqty: event.option.value.qty === 0 ? 1 : event.option.value.qty,
				tempmrp: event.option.value.mrp,
			});
			this.lineItemData = event.option.value;
			this.selected_description = event.option.value.description;
			this.selected_mrp = event.option.value.mrp;

			setTimeout(() => {
				this.qty && this.qty.nativeElement.focus();
				// this.qty && this.qty.nativeElement.select();
			}, 10);
		}
		this.qty && this.qty.nativeElement.focus();
	}

	displayFn(obj: any): string | undefined {
		return obj && obj.name ? obj.name : undefined;
	}

	displayProdFn(obj: any): string | undefined {
		return obj && obj.product_code ? obj.product_code : undefined;
	}

	getLength() {
		const control = <FormArray>this.submitForm.controls['productarr'];
		return control.length;
	}

	searchProducts() {
		let invdt = '';
		if (this.submitForm.value.invoicedate === null) {
			invdt = moment().format('DD-MM-YYYY');
		} else {
			invdt = moment(this.submitForm.value.invoicedate).format('DD-MM-YYYY');
		}

		this.submitForm.controls['productctrl'].valueChanges
			.pipe(
				debounceTime(300),
				tap(() => (this.isLoading = true)),
				switchMap((id: any) => {
					if (id != null && id.length >= 1) {
						return this._commonApiService.getProductInformation({
							centerid: this.userdata.center_id,
							customerid: this.customerdata.id,
							orderdate: invdt,
							searchstr: id,
						});
					} else {
						return empty();
					}
				}),
			)

			.subscribe((data: any) => {
				this.isLoading = false;
				this.product_lis = data.body;

				this._cdr.markForCheck();
			});
	}

	// Navigation
	salesDashboard() {
		this._router.navigateByUrl('/home/search-sales');
	}

	stockIssuesDashboard() {
		this._router.navigateByUrl('/home/search-stock-issues');
	}

	async add($event) {
		$event.preventDefault();

		let invdt = '';
		if (this.submitForm.value.invoicedate === null) {
			invdt = moment().format('DD-MM-YYYY');
		} else {
			invdt = moment(this.submitForm.value.invoicedate).format('DD-MM-YYYY');
		}

		if (this.submitForm.value.tempdesc === '' || this.submitForm.value.tempdesc === null) {
			this.submitForm.controls['tempdesc'].setErrors({ required: true });
			this.submitForm.controls['tempdesc'].markAsTouched();

			return false;
		}

		if (this.submitForm.value.tempqty === '' || this.submitForm.value.tempqty === null || this.submitForm.value.tempqty === 0) {
			this.submitForm.controls['tempqty'].setErrors({ required: true });
			this.submitForm.controls['tempqty'].markAsTouched();

			return false;
		}
		if (this.submitForm.value.tempmrp === '' || this.submitForm.value.tempmrp === null || this.submitForm.value.tempmrp === 0) {
			this.submitForm.controls['tempmrp'].setErrors({ required: true });
			this.submitForm.controls['tempmrp'].markAsTouched();

			return false;
		}

		if (this.submitForm.value.customerctrl === '' || this.submitForm.value.customerctrl === null) {
			this.submitForm.controls['customerctrl'].setErrors({ required: true });
			this.submitForm.controls['customerctrl'].markAsTouched();

			return false;
		}

		// this line over writes default qty vs entered qty
		this.lineItemData.qty = this.submitForm.value.tempqty;
		this.lineItemData.mrp = this.submitForm.value.tempmrp;

		this.itemAdd(this.lineItemData);
	}

	itemAdd(lineItemData) {
		// lineitemdata is the input box row to add items
		this.processItems(this.lineItemData, 'loadingnow');

		this.submitForm.patchValue({
			productctrl: '',
			tempdesc: '',
			tempmrp: 0,
			tempqty: 1,
		});

		this.submitForm.controls['tempdesc'].setErrors(null);
		this.submitForm.controls['tempqty'].setErrors(null);
		this.submitForm.controls['tempmrp'].setErrors(null);
		this.submitForm.controls['productctrl'].setErrors(null);
		// this.plist.nativeElement.focus();
		this.plist && this.plist.nativeElement.focus();

		this.selected_description = '';
		this.selected_mrp = '';

		this._cdr.markForCheck();
	}

	setCustomerInfo(event, from) {
		if (event !== undefined) {
			this.iscustomerselected = true;
			if (from === 'tab') {
				this.customer_state_code = event.code;

				this.customerdata = event;

				if (this.customerdata.name === 'Walk In') {
					this.isRetailCustomer = 'Y';
				} else {
					this.isRetailCustomer = 'N';
				}

				this._cdr.detectChanges();
				this.setTaxLabel(this.customer_state_code);
			} else {
				this.customer_state_code = event.option.value.code;

				this.customerdata = event.option.value;

				if (this.customerdata.name === 'Walk In') {
					this.isRetailCustomer = 'Y';
				} else {
					this.isRetailCustomer = 'N';
				}

				this._cdr.detectChanges();
				this.setTaxLabel(this.customer_state_code);

				this.plist && this.plist.nativeElement.focus();
			}
		}
	}

	openDialog(event): void {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '600px';
		dialogConfig.height = '100%';
		dialogConfig.data = this.customerdata;
		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(CustomerViewDialogComponent, dialogConfig);

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
		});
	}

	addCustomer() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '500px';
		dialogConfig.height = '100%';
		dialogConfig.position = { top: '0', right: '0' };
		dialogConfig.panelClass = 'app-full-bleed-dialog';

		const dialogRef = this._dialog.open(CustomerAddDialogComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					this._cdr.markForCheck();
				}),
			)
			.subscribe((data: any) => {
				if (data === 'success') {
					this.clearInput();
					this.openSnackBar('INFO: Customer added successfully!', '', 'mat-primary');
				}
			});
	}

	logScrolling(event) {
		if (this.autoTrigger1 && this.autoTrigger1.panelOpen) {
			this.autoTrigger1.closePanel();
		}

		if (this.autoTrigger2 && this.autoTrigger2.panelOpen) {
			this.autoTrigger2.closePanel();
		}
	}

	openSnackBar(message: string, action: string, color: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', color],
		});
	}

	addProduct() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '50%';
		dialogConfig.height = '100%';
		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(ProductAddDialogComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					this._cdr.markForCheck();
				}),
			)
			.subscribe((data: any) => {
				if (data === 'success') {
					const dialogConfigSuccess = new MatDialogConfig();
					dialogConfigSuccess.disableClose = false;
					dialogConfigSuccess.autoFocus = true;
					dialogConfigSuccess.width = '25%';
					dialogConfigSuccess.height = '25%';
					dialogConfigSuccess.data = 'Product added successfully';

					const dialogRef = this._dialog.open(SuccessMessageDialogComponent, dialogConfigSuccess);
				}
			});
	}

	ScrollToTop() {
		this.content.scrollToTop(1500);
	}

	async showInventoryReportsDialog(product_code, product_id) {
		const modal = await this._modalcontroller.create({
			component: InventoryReportsDialogComponent,
			componentProps: { center_id: this.userdata.center_id, product_code: product_code, product_id: product_id },
			cssClass: 'select-modal',
		});

		modal.onDidDismiss().then((result) => {
			this._cdr.markForCheck();
		});

		await modal.present();
	}

	openManualInvoiceDialog(): void {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '600px';
		dialogConfig.height = '100%';
		dialogConfig.data = this.customerdata;
		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(ManualInvoiceNumberDialogComponent, dialogConfig);

		// dialogRef.afterClosed().subscribe((result) => {
		// 	console.log('The dialog was closed');
		// });

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					this._cdr.markForCheck();
				}),
			)
			.subscribe((data: any) => {
				if (data !== '') {
					console.log('dinesh manual invoice #' + data);

					this.submitForm.patchValue({
						inv_gen_mode: 'M',
						invoiceno: data,
					});

					this.openSnackBar(`INFO: Manual Invoice# ${data} Created!`, '', 'mat-primary');
					// set the inv_get_mode to 'M"
				}
			});
	}

	// @HostListener('window:beforeunload', ['$event'])
	// beforeUnloadHander($event) {
	// 	$event.returnValue = 'Your changes will not be saved';

	// 	return true;
	// }
}

// KEY FIELDS
// QTY, MRP, DISC(%), TAX(%), NET VALUE(2 TYPE CALC NET/GROSS)
// TOTAL VALUE - VERTICAL SUMMARY OF ALL ROWS

// after customer is added need to fetch customer details and populate back the customer list

// 		.subscribe((data: any) => {
// 			if (data !== 'close') {
// 				this._commonApiService.getCustomerDetails(this.userdata.center_id, data.body.id).subscribe((custData: any) => {
// 					this.customerdata = custData[0];

// 					this.customername = custData[0].name;
// 					this.iscustomerselected = true;

// 					this.setTaxLabel(custData[0].code);

// 					this.setCustomerInfo(custData[0], 'tab');

// 					this.submitForm.patchValue({
// 						customerctrl: custData[0],
// 					});

// 					this.isCLoading = false;
// 					this.autoTrigger1.closePanel();

// 					this._cdr.markForCheck();
// 				});
// 			} else {
// 				this.iscustomerselected = false;
// 				this.autoTrigger1.closePanel();

// 				this._cdr.markForCheck();
// 			}

// @HostListener('unloaded')
// ngOnDestroy() {
//     console.log('Cleared');
// }
