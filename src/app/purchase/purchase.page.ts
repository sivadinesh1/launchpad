import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ModalController, PickerController, AlertController } from '@ionic/angular';

import { CommonApiService } from '../services/common-api.service';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CurrencyPadComponent } from '../components/currency-pad/currency-pad.component';

import { AuthenticationService } from '../services/authentication.service';
import { ChangeTaxComponent } from '../components/change-tax/change-tax.component';
import { ChangeMrpComponent } from '../components/change-mrp/change-mrp.component';
import { Route, ActivatedRoute, Router } from '@angular/router';
import { NullToQuotePipe } from '../util/pipes/null-quote.pipe';
import { filter, tap, debounceTime, switchMap } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

import { Product } from '../models/Product';
import { empty } from 'rxjs';
import { RequireMatch } from '../util/directives/requireMatch';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { IonContent } from '@ionic/angular';
import { VendorViewDialogComponent } from '../components/vendors/vendor-view-dialog/vendor-view-dialog.component';
import { Vendor } from '../models/Vendor';
import * as moment from 'moment';
import { VendorAddDialogComponent } from '../components/vendors/vendor-add-dialog/vendor-add-dialog.component';

import { Observable } from 'rxjs';
import { User } from '../models/User';

import { ChangeDetectionStrategy } from '@angular/core';
import { InventoryReportsDialogComponent } from '../components/reports/inventory-reports-dialog/inventory-reports-dialog.component';
@Component({
	selector: 'app-purchase',
	templateUrl: './purchase.page.html',
	styleUrls: ['./purchase.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchasePage implements OnInit {
	breadmenu = 'New Purchase';
	vendorname: string = '';
	vendorstate = '';

	listArr = [];

	total = '0.00';
	items = Array.from({ length: 100000 }).map((_, i) => `Item #${i}`);
	// test1: any;
	vendor_state_code: any;
	// center_state_code: any
	i_gst: any;
	vendordata: any;
	submitForm: FormGroup;

	vendorselected: any;

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
	// center_id: any;

	removeRowArr = [];
	deletedRowArr = [];

	showDelIcon = false;
	singleRowSelected = false;
	purchaseid: any;
	rawPurchaseData: any;

	maxDate = new Date();
	maxOrderDate = new Date();

	isVLoading = false;
	isLoading = false;

	isvendorselected = false;
	vendor_lis: Vendor[];
	product_lis: Product[];
	lineItemData: any;

	userdata$: Observable<User>;
	userdata: any;
	clicked = false;

	selected_description = '';
	selected_mrp = '';
	orig_mrp = 0;

	ready = 0; // flag check - centerid (localstorage) & customerid (param)

	@ViewChild('invno', { static: false }) inputEl: ElementRef;
	@ViewChild('orderno', { static: false }) orderNoEl: ElementRef;
	@ViewChildren('myCheckbox') private myCheckboxes: QueryList<any>;

	// TAB navigation for product list
	@ViewChild('typehead', { read: MatAutocompleteTrigger })
	autoTrigger: MatAutocompleteTrigger;

	@ViewChild('plist', { static: true }) plist: any;
	@ViewChild('vlist', { static: true }) vlist: any;
	@ViewChild('newrow', { static: true }) newrow: any;

	@ViewChild('qty', { static: true }) qty: any;

	// TAB navigation for vendor list
	@ViewChild('typehead1', { read: MatAutocompleteTrigger })
	autoTrigger1: MatAutocompleteTrigger;

	@ViewChild(IonContent, { static: false }) content: IonContent;

	draftConfirm = [
		{
			text: 'Cancel',
			role: 'cancel',
			cssClass: 'secondary',
			handler: (blah) => {
				console.log('Confirm Cancel: blah');
			},
		},
		{
			text: 'Save & Exit to Purchase Orders List',
			cssClass: 'secondary',
			handler: () => {
				console.log('Confirm Cancel: blah');
				this.mainSubmit('add', 'back');
			},
		},
		{
			text: 'Save & Continue',
			cssClass: 'primary',
			handler: () => {
				console.log('Confirm Okay');
				this.mainSubmit('add', 'stay');
			},
		},
	];

	constructor(
		private _modalcontroller: ModalController,
		private _pickerctrl: PickerController,
		public dialog: MatDialog,
		public alertController: AlertController,
		private _route: ActivatedRoute,
		private _router: Router,
		private _dialog: MatDialog,
		private _authservice: AuthenticationService,
		private _snackBar: MatSnackBar,
		private _commonApiService: CommonApiService,
		private _fb: FormBuilder,
		private spinner: NgxSpinnerService,
		private _cdr: ChangeDetectorRef,
	) {
		// this.init();

		this.userdata$ = this._authservice.currentUser;
		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this._authservice.setCurrentMenu('PURCHASE');
			this.userdata = data;

			this.ready = 1;

			// data change
			this._route.data.subscribe((data) => {
				this.clicked = false;
				this.init();
				this._authservice.setCurrentMenu('PURCHASE');
				this.listArr = [];
				this.rawPurchaseData = data['rawpurchasedata'];
			});

			// param change
			this._route.params.subscribe((params) => {
				this.clicked = false;
				this.submitForm.patchValue({
					centerid: data.center_id,
				});

				if (this.userdata !== undefined) {
					this.initialize();
					this.clearInput();
					this.submitForm.patchValue({
						center_id: this.userdata.center_id,
					});
				}
			});

			this._cdr.markForCheck();
		});
	}

	ngOnInit() {}
	initialize() {
		// this.init();

		this.vendorselected = false;

		// navigating from list purchase page
		this.buildRawPurchaseData();
	}

	buildRawPurchaseData() {
		if (this.rawPurchaseData[0] !== undefined && this.rawPurchaseData[0].id !== 0) {
			this.spinner.show();
			this.breadmenu = 'Edit Purchase #' + this.rawPurchaseData[0].id;

			this.submitForm.patchValue({
				purchaseid: this.rawPurchaseData[0].id,
				invoiceno: this.rawPurchaseData[0].invoice_no,
				invoicedate: new Date(new NullToQuotePipe().transform(this.rawPurchaseData[0].invoice_date).replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),

				orderdate:
					this.rawPurchaseData[0].order_date === ''
						? ''
						: new Date(new NullToQuotePipe().transform(this.rawPurchaseData[0].order_date).replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),

				lrno: this.rawPurchaseData[0].lr_no,

				lrdate:
					this.rawPurchaseData[0].lr_date === ''
						? ''
						: new Date(new NullToQuotePipe().transform(this.rawPurchaseData[0].lr_date).replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),
				orderno: this.rawPurchaseData[0].order_no,
				noofboxes: this.rawPurchaseData[0].no_of_boxes,

				orderrcvddt:
					this.rawPurchaseData[0].received_date === ''
						? ''
						: new Date(new NullToQuotePipe().transform(this.rawPurchaseData[0].received_date).replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),

				noofitems: this.rawPurchaseData[0].no_of_items,
				totalqty: this.rawPurchaseData[0].total_qty,
				value: this.rawPurchaseData[0].total_value,
				totalvalue: this.rawPurchaseData[0].total_value,
				igst: this.rawPurchaseData[0].igst,
				cgst: this.rawPurchaseData[0].cgst,
				sgst: this.rawPurchaseData[0].sgst,
				transport_charges: this.rawPurchaseData[0].transport_charges,
				unloading_charges: this.rawPurchaseData[0].unloading_charges,
				misc_charges: this.rawPurchaseData[0].misc_charges,
				net_total: this.rawPurchaseData[0].net_total,
				taxable_value: this.rawPurchaseData[0].taxable_value,
				status: this.rawPurchaseData[0].status,
				revision: this.rawPurchaseData[0].revision,
			});

			this._cdr.markForCheck();

			this._commonApiService.getVendorDetails(this.userdata.center_id, this.rawPurchaseData[0].vendor_id).subscribe((vendData: any) => {
				this.vendordata = vendData[0];
				this.vendor_state_code = vendData[0].code;

				this.submitForm.patchValue({
					vendorctrl: vendData[0],
				});

				this.vendorname = vendData[0].name;
				this.vendorstate = vendData[0].state;
				this.vendorselected = true;
				this.setTaxLabel();
				this.setTaxSegment(vendData[0].taxrate);

				this._cdr.markForCheck();
			});

			this._commonApiService.purchaseDetails(this.rawPurchaseData[0].id).subscribe((purchaseData: any) => {
				this.spinner.hide();
				let pData = purchaseData;

				pData.forEach((element) => {
					this.processItems(element, 'preload');
				});
			});

			this._cdr.markForCheck();
		}
	}

	init() {
		this.submitForm = this._fb.group({
			centerid: [null],
			purchaseid: new FormControl('', Validators.required),
			vendor: new FormControl(null, Validators.required),
			invoiceno: new FormControl(null, Validators.required),
			invoicedate: new FormControl(null, Validators.required),
			orderno: new FormControl(''),
			orderdate: new FormControl(''),
			lrno: new FormControl(''),
			lrdate: new FormControl(''),
			noofboxes: new FormControl(0),
			orderrcvddt: new FormControl(''),
			noofitems: new FormControl(0),
			totalqty: new FormControl(0),
			value: new FormControl(0),
			totalvalue: new FormControl(0),
			igst: new FormControl(0),
			cgst: new FormControl(0),
			sgst: new FormControl(0),
			transport_charges: new FormControl(0),
			unloading_charges: new FormControl(0),
			misc_charges: new FormControl(0),
			net_total: new FormControl(0),
			taxable_value: new FormControl(0),
			status: new FormControl('D'),

			vendorctrl: [null, [Validators.required, RequireMatch]],
			productctrl: [null, [RequireMatch]],
			tempdesc: [''],
			temppurchaseprice: [''],
			tempmrp: [''],
			tempqty: ['1', [Validators.required, Validators.max(1000), Validators.min(1), Validators.pattern(/\-?\d*\.?\d{1,2}/)]],

			productarr: new FormControl(null, Validators.required),
			roundoff: [0],
			revision: new FormControl(0),
		});

		this.searchVendors();
		this.searchProducts();
	}

	ngAfterViewInit() {
		this.autoTrigger &&
			this.autoTrigger.panelClosingActions.subscribe((x) => {
				if (this.autoTrigger.activeOption && this.autoTrigger.activeOption.value !== undefined) {
					this.submitForm.patchValue({
						productctrl: this.autoTrigger.activeOption.value,
					});
					this.setItemDesc(this.autoTrigger.activeOption.value, 'tab');
				}
			});

		this.autoTrigger1 &&
			this.autoTrigger1.panelClosingActions.subscribe((x) => {
				if (this.autoTrigger1.activeOption && this.autoTrigger1.activeOption.value !== undefined) {
					this.submitForm.patchValue({
						vendorctrl: this.autoTrigger1.activeOption.value,
					});
					this.setVendorInfo(this.autoTrigger1.activeOption.value, 'tab');
				}
			});

		setTimeout(() => {
			this.vlist && this.vlist.nativeElement.focus();
			if (this.rawPurchaseData[0] !== undefined && this.rawPurchaseData[0].id !== 0) {
				this.plist && this.plist.nativeElement.focus();
			}
			this._cdr.detectChanges();
		}, 100);
	}

	clearInput() {
		this.submitForm.patchValue({
			vendorctrl: null,
		});

		this.vendorselected = false;

		this._cdr.markForCheck();
	}

	searchVendors() {
		let search = '';
		this.submitForm.controls['vendorctrl'].valueChanges
			.pipe(
				debounceTime(300),
				tap(() => (this.isVLoading = true)),
				switchMap((id: any) => {
					console.log(id);
					search = id;
					if (id != null && id.length >= 2) {
						return this._commonApiService.getVendorInfo({
							centerid: this.userdata.center_id,
							searchstr: id,
						});
					} else {
						return empty();
					}
				}),
			)

			.subscribe((data: any) => {
				this.isVLoading = false;
				this.vendor_lis = data.body;

				this._cdr.markForCheck();
			});
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
					if (id != null && id.length >= 2) {
						return this._commonApiService.getProductInfo({
							centerid: this.userdata.center_id,
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

	// type/search product code
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
						},
					},
					{
						text: 'Continue to Add',
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

	addLineItemData(event, from) {
		if (from === 'tab') {
			this.orig_mrp = event.mrp;
			this.submitForm.patchValue({
				tempdesc: event.description,
				tempqty: event.qty === 0 ? 1 : event.qty,
				tempmrp: event.mrp,
				temppurchaseprice: event.purchase_price === 'null' ? '0' : event.purchase_price === '0.00' ? '0' : event.purchase_price,
			});
			this.lineItemData = event;
			this.selected_description = event.description;
			this.selected_mrp = event.mrp;
		} else {
			this.orig_mrp = event.option.value.mrp;
			this.submitForm.patchValue({
				tempdesc: event.option.value.description,
				tempqty: event.option.value.qty === 0 ? 1 : event.option.value.qty,
				tempmrp: event.option.value.mrp,
				temppurchaseprice:
					event.option.value.purchase_price === 'null' ? '0' : event.option.value.purchase_price === '0.00' ? '0' : event.option.value.purchase_price,
			});
			this.lineItemData = event.option.value;
			this.selected_description = event.option.value.description;
			this.selected_mrp = event.option.value.mrp;

			setTimeout(() => {
				this.qty && this.qty.nativeElement.focus();
				// this.qty && this.qty.nativeElement.select();
			}, 10);
		}
	}

	processItems(temp, type) {
		this.setTaxSegment(temp.taxrate);

		let pid = '';
		if (this.rawPurchaseData[0] !== undefined) {
			pid = new NullToQuotePipe().transform(this.rawPurchaseData[0].id);
		}

		let oldval = 0;

		if (new NullToQuotePipe().transform(temp.id) !== '') {
			oldval = temp.qty;
		}

		// from product tbl
		this.listArr.push({
			purchase_id: pid,
			pur_det_id: new NullToQuotePipe().transform(temp.id),
			checkbox: false,
			product_id: temp.product_id,
			product_code: temp.product_code,
			product_desc: temp.description,
			qty: temp.qty,
			packetsize: temp.packetsize,
			unit_price: temp.purchase_price,
			purchase_price: temp.purchase_price,
			mrp: temp.mrp,
			mrp_change_flag: temp.mrp_change_flag,
			taxrate: temp.taxrate,

			tax_value: (temp.purchase_price * temp.qty * (temp.taxrate / 100)).toFixed(2),

			taxable_value: temp.purchase_price * temp.qty,
			total_value: (temp.purchase_price * temp.qty + (temp.purchase_price * temp.qty * temp.taxrate) / 100).toFixed(2),

			igst: this.igst,
			cgst: this.cgst,
			sgst: this.sgst,
			old_val: oldval,
			stock_pk: temp.stock_pk,
			qtyerror: '',
			pperror: '',
			hsncode: temp.hsncode,
		});

		const tempArr = this.listArr.map((arrItem) => {
			return parseFloat(arrItem.total_value);
		});

		const tempArrCostPrice = this.listArr.map((arr) => {
			return parseFloat(arr.purchase_price);
		});

		this.total = tempArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0).toFixed(2);

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

		this.listArr = [...this.listArr];
		this._cdr.detectChanges();
	}

	displayFn(obj: any): string | undefined {
		return obj && obj.name ? obj.name : undefined;
	}

	displayProdFn(obj: any): string | undefined {
		return obj && obj.product_code ? obj.product_code : undefined;
	}

	clearProdInput() {
		this.submitForm.patchValue({
			productctrl: null,
			tempmrp: 0,
			tempdesc: null,
			tempqty: 1,
		});
		this.product_lis = null;
		this.selected_description = '';
		this.selected_mrp = '';
		this._cdr.markForCheck();
	}

	setVendorInfo(event, from) {
		if (from === 'click' && event.option.value === 'new') {
			this.addVendor();
		}
		if (event !== undefined) {
			this.vendorselected = true;
			if (from === 'tab') {
				this.vendordata = event;
				this.vendor_state_code = this.vendordata.code;
				this.setTaxLabel();

				this._cdr.detectChanges();
				this._cdr.markForCheck();
			} else {
				this.vendordata = event.option.value;
				this.vendor_state_code = this.vendordata.code;
				this.setTaxLabel();

				this.plist && this.plist.nativeElement.focus();
				this._cdr.detectChanges();
				this._cdr.markForCheck();
			}
		}
	}

	sumTotalTax() {
		if (this.i_gst) {
			this.igstTotal = this.listArr
				.map((item) => {
					return (item.purchase_price * item.qty * parseFloat(item.taxrate)) / 100;
				})
				.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
				.toFixed(2);

			this.submitForm.patchValue({
				igst: this.igstTotal,
				cgst: 0,
				sgst: 0,
			});
		} else {
			this.cgstTotal = this.listArr
				.map((item) => {
					return item.purchase_price * item.qty * (parseFloat(this.cgst) / 100);
				})
				.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
				.toFixed(2);

			this.sgstTotal = this.listArr
				.map((item) => {
					return (item.purchase_price * item.qty * parseFloat(this.sgst)) / 100;
				})
				.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
				.toFixed(2);

			this.submitForm.patchValue({
				cgst: this.cgstTotal,
				sgst: this.sgstTotal,
				igst: 0,
			});
		}
	}

	deleteProduct(idx) {
		let test = this.listArr[idx];

		if (this.listArr[idx].pur_det_id != '') {
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
		if (this.vendor_state_code !== this.userdata.code) {
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

	setTaxLabel() {
		if (this.vendor_state_code !== this.userdata.code) {
			this.i_gst = true;
		} else {
			this.i_gst = false;
		}
	}

	// draft - status
	onSave(action) {
		this.onSubmit(action);
	}

	// final c completed - status
	onSavenSubmit(action) {
		this.onSubmit(action);
	}

	validateForms() {
		if (this.submitForm.value.invoiceno == null) {
			this.inputEl.nativeElement.focus();
			this.presentAlert('Enter Invoice number!');
			return false;
		}

		if (this.submitForm.value.invoicedate == null) {
			this.presentAlert('Enter Invoice Date!');
			return false;
		}

		if (this.submitForm.value.orderrcvddt == '' || this.submitForm.value.orderrcvddt == null) {
			this.presentAlert('Enter Received Date!');
			return false;
		}

		if (this.submitForm.value.invoicedate !== null && this.submitForm.value.orderdate !== '') {
			if (this.submitForm.value.orderno === '') {
				this.orderNoEl.nativeElement.focus();
				this.presentAlert('Order Date without Order # not allowed');
				return false;
			}

			if (this.submitForm.value.orderdate > this.submitForm.value.invoicedate) {
				this.presentAlert('Order date should be less than Invoice date');
				return false;
			}
		}

		if (this.submitForm.value.invoicedate !== null && this.submitForm.value.lrdate !== '') {
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

	chcekpperrors() {
		return this.listArr.some((e) => {
			if (e.pperror !== '') {
				return true;
			}
		});
	}

	onSubmit(action) {
		if (this.listArr.length == 0) {
			return this.presentAlert('No products added to save!');
		}

		if (this.listArr.length > 0) {
			console.log('check ' + this.checkerrors());

			if (this.checkerrors()) {
				return this.presentAlert('Fix errors in products quantity !');
			}

			if (this.chcekpperrors()) {
				return this.presentAlert('Fix errors in purchase price !');
			}

			if (this.validateForms()) {
				if (action === 'add') {
					this.presentAlertConfirm('add');
				} else {
					this.presentAlertConfirm('draft');
				}

				this.submitForm.patchValue({
					productarr: this.listArr,
				});

				this.submitForm.patchValue({
					noofitems: this.listArr.length,
				});

				this.submitForm.patchValue({
					vendorctrl: this.vendordata,
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

				// let tmpNetTot = parseFloat(this.total) + parseFloat(this.submitForm.value.transport_charges) +
				//   parseFloat(this.submitForm.value.unloading_charges) +
				//   parseFloat(this.submitForm.value.misc_charges);

				// this.submitForm.patchValue({
				//   net_total: tmpNetTot
				// })

				this.submitForm.patchValue({
					net_total: this.getNetTotal('rounding'),
					roundoff: (this.getNetTotal('rounding') - this.getNetTotal('withoutrounding')).toFixed(2),
				});
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

	openCurrencyPad(idx) {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '400px';

		const dialogRef = this.dialog.open(CurrencyPadComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap((val) => {
					this.listArr[idx].qty = val;
					this.qtyChange(idx);
				}),
			)
			.subscribe();
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

	qtyChange(idx) {
		this.listArr[idx].total_value = (
			this.listArr[idx].purchase_price * this.listArr[idx].qty +
			(this.listArr[idx].purchase_price * this.listArr[idx].qty * this.listArr[idx].taxrate) / 100
		).toFixed(2);
		this.listArr[idx].taxable_value = (this.listArr[idx].qty * this.listArr[idx].purchase_price).toFixed(2);
		this.listArr[idx].tax_value = (this.listArr[idx].taxable_value * (this.listArr[idx].taxrate / 100)).toFixed(2);

		this.calc();

		this._cdr.markForCheck();
	}

	calc() {
		const tempArr = this.listArr.map((arrItem) => {
			return parseFloat(arrItem.taxable_value) + parseFloat(arrItem.tax_value);
		});

		const tempArrCostPrice = this.listArr.map((arr) => {
			return parseFloat(arr.purchase_price) * parseFloat(arr.qty);
		});

		// this.total = "" + tempArr;

		// this.total = tempArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0).toFixed(2);
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

	async presentAlertConfirm(action) {
		this.submitForm.patchValue({
			centerid: this.userdata.center_id,
		});

		const alert = await this.alertController.create({
			header: 'Confirm!',
			message: 'Are you sure to?',
			cssClass: 'buttonCss',
			buttons: this.draftConfirm,
		});

		await alert.present();
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

		this._commonApiService.savePurchaseOrder(this.submitForm.value).subscribe((data: any) => {
			this.spinner.hide();
			this.clicked = false;
			//	console.log('savePurchaseOrder ' + JSON.stringify(data));

			if (data.body.result === 'success') {
				if (navto === 'back') {
					this.submitForm.reset();
					this.init();
					this.vendordata = null;
					this.submitForm.patchValue({
						productarr: [],
					});
					this.vendorname = '';
					this.vendorselected = false;

					this.listArr = [];

					this.total = '0.00';
					this.igstTotal = '0.00';
					this.cgstTotal = '0.00';
					this.sgstTotal = '0.00';
				}
				this._cdr.markForCheck();
				if (action === 'add') {
					this.listArr = [];

					// add to the submitform purchaseid
					// reset listArr,
					// call raspurchaseid
					// set mode to edit
					this.submitForm.patchValue({
						purchaseid: data.body.id,
					});
					this._commonApiService.purchaseMasterData(data.body.id).subscribe((data) => {
						this.rawPurchaseData = data;
						this._cdr.markForCheck();
						this.buildRawPurchaseData();
					});

					this.openSnackBar('Items Added!', '');
				} else {
					this.openSnackBar('Saved to Draft!', '');
				}

				if (navto === 'back') {
					this.purchaseDashboard();
				}
			} else {
				this.presentAlert('Error: Something went wrong Contact Admin!');
			}

			this._cdr.markForCheck();
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
			.deletePurchaseDetails({
				center_id: this.userdata.center_id,
				id: elem.pur_det_id,
				purchaseid: elem.purchase_id,
				qty: elem.qty,
				product_id: elem.product_id,
				stock_id: elem.stock_pk,
				mrp: elem.mrp,
				autidneeded: true,
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
		// this.presentTaxValueChangeConfirm();

		const modalTax = await this._modalcontroller.create({
			component: ChangeTaxComponent,
			componentProps: { pArry: this.listArr, rArry: this.removeRowArr },
			cssClass: 'tax-edit-modal',
		});

		modalTax.onDidDismiss().then((result) => {
			console.log('The result:', result);

			if (result.data !== undefined) {
				let myCheckboxes = this.myCheckboxes.toArray();

				this.removeRowArr.forEach((idx) => {
					this.listArr[idx].taxrate = result.data;
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

		// when pop up close with new mrp value, set those value to the line item.
		// will always be single row mrp edit
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

					this.delIconStatus();
					this.checkIsSingleRow();

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

	logScrolling(event) {
		if (this.autoTrigger1 && this.autoTrigger1.panelOpen) {
			this.autoTrigger1.closePanel();
		}

		if (this.autoTrigger && this.autoTrigger.panelOpen) {
			this.autoTrigger.closePanel();
		}
	}

	purchaseDashboard() {
		this._router.navigateByUrl('/home/search-purchase');
	}

	// ScrollToBottom() {
	//   this.content.scrollToBottom(1500);
	// }

	ScrollToTop() {
		this.content.scrollToTop(1500);
	}

	ScrollToPoint(X, Y) {
		this.content.scrollToPoint(X, Y, 300);
	}

	openDialog(event): void {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '400px';
		dialogConfig.height = '100%';
		dialogConfig.data = this.vendordata;
		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(VendorViewDialogComponent, dialogConfig);

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
		});
	}

	addVendor() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '80%';
		dialogConfig.height = '80%';

		const dialogRef = this._dialog.open(VendorAddDialogComponent, dialogConfig);

		dialogRef
			.afterClosed()
			.pipe(
				filter((val) => !!val),
				tap(() => {
					// do nothing check
					this._cdr.markForCheck();
				}),
			)
			.subscribe((data: any) => {
				if (data !== 'close') {
					this._commonApiService.getVendorDetails(this.userdata.center_id, data.body.id).subscribe((vendData: any) => {
						this.vendordata = vendData[0];

						this.vendorname = vendData[0].name;
						this.vendorselected = true;

						this.setVendorInfo(vendData[0], 'tab');

						this.submitForm.patchValue({
							vendorctrl: vendData[0],
						});

						this.isVLoading = false;
						this.autoTrigger1.closePanel();

						this._cdr.markForCheck();
					});
				} else {
					this.vendorselected = false;
					this.autoTrigger1.closePanel();

					this._cdr.markForCheck();
				}

				this._cdr.markForCheck();
			});
	}

	async add() {
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

		if (
			this.submitForm.value.temppurchaseprice === '' ||
			this.submitForm.value.temppurchaseprice === '0' ||
			this.submitForm.value.temppurchaseprice === null
		) {
			this.submitForm.controls['temppurchaseprice'].setErrors({
				required: true,
			});
			this.submitForm.controls['temppurchaseprice'].markAsTouched();

			return false;
		}

		if (this.submitForm.value.tempqty === '' || this.submitForm.value.tempqty === null) {
			this.submitForm.controls['tempqty'].setErrors({ required: true });
			this.submitForm.controls['tempqty'].markAsTouched();

			return false;
		}

		if (this.submitForm.value.tempmrp === '' || this.submitForm.value.tempmrp === null || this.submitForm.value.tempmrp === 0) {
			this.submitForm.controls['tempmrp'].setErrors({ required: true });
			this.submitForm.controls['tempmrp'].markAsTouched();

			return false;
		}

		if (this.submitForm.value.customerctrl === '' || this.submitForm.value.vendorctrl === null) {
			this.submitForm.controls['vendorctrl'].setErrors({ required: true });
			this.submitForm.controls['vendorctrl'].markAsTouched();

			return false;
		}

		// this line over writes default qty vs entered qty
		this.lineItemData.qty = this.submitForm.value.tempqty;
		this.lineItemData.purchase_price = this.submitForm.value.temppurchaseprice;
		this.lineItemData.mrp = this.submitForm.value.tempmrp;

		if (this.orig_mrp !== this.submitForm.value.tempmrp) {
			this.lineItemData.mrp_change_flag = 'Y';
		} else {
			this.lineItemData.mrp_change_flag = 'N';
		}

		// let onlyProductCodeArr = this.listArr.map((element) => {
		// 	return element.product_code;
		// });

		// let isduplicate = onlyProductCodeArr.includes(this.lineItemData.product_code);
		// let proceed = false;

		// if (isduplicate) {
		// 	const alert = await this.alertController.create({
		// 		header: 'Confirm!',
		// 		message: 'The Item already added. Do you want to add again?',
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
		// 				text: 'Continue to Add',
		// 				handler: () => {
		// 					console.log('Confirm Okay');
		// 					proceed = true;
		// 					this.itemAdd(this.lineItemData);
		// 				},
		// 			},
		// 		],
		// 	});

		// 	await alert.present();
		// } else {
		this.itemAdd(this.lineItemData);
		// }
	}

	itemAdd(lineItemData) {
		this.processItems(this.lineItemData, 'loadingnow');

		this.submitForm.patchValue({
			productctrl: '',
			tempdesc: '',
			tempmrp: 0,
			temppurchaseprice: '',
			tempqty: 1,
		});

		this.submitForm.controls['tempdesc'].setErrors(null);
		this.submitForm.controls['tempqty'].setErrors(null);
		this.submitForm.controls['tempmrp'].setErrors(null);
		this.submitForm.controls['temppurchaseprice'].setErrors(null);
		this.submitForm.controls['productctrl'].setErrors(null);
		this.plist && this.plist.nativeElement.focus();

		this.selected_description = '';
		this.selected_mrp = '';

		this._cdr.markForCheck();
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
						//main submit
						this.clicked = true; // disable all buttons after submission
						this._cdr.markForCheck();
						this._router.navigateByUrl('/home/search-purchase');
					},
				},
			],
		});

		await alert.present();
	}

	roundingFn(value, param) {
		if (param === 'rounding') {
			return Math.round(+value.toFixed(2));
		} else if (param === 'withoutrounding') {
			return +value.toFixed(2);
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

	handlePPChange($event, idx) {
		let val = $event.target.value;

		if (val > 0) {
			this.listArr[idx].purchase_price = $event.target.value;
			this.qtyChange(idx);
			this.listArr[idx].pperror = '';
			this._cdr.detectChanges();
		} else {
			this.listArr[idx].pperror = 'error';
			this._cdr.detectChanges();
		}
	}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', 'mat-primary'],
		});
	}
	identify(index, item) {
		return item.id;
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
}
