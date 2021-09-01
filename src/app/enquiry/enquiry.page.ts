import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray, NgForm } from '@angular/forms';
import { CurrencyPadComponent } from '../components/currency-pad/currency-pad.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalController, AlertController } from '@ionic/angular';

import { CommonApiService } from '../services/common-api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

import { Observable } from 'rxjs';
import { filter, map, startWith, debounceTime, switchMap, tap, finalize } from 'rxjs/operators';

import { User } from '../models/User';
import { Customer } from 'src/app/models/Customer';

import { RequireMatch as RequireMatch } from '../util/directives/requireMatch';
import { Product } from '../models/Product';
import { empty, of } from 'rxjs';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { CustomerViewDialogComponent } from '../components/customers/customer-view-dialog/customer-view-dialog.component';
import { IonContent } from '@ionic/angular';
import { CustomerAddDialogComponent } from '../components/customers/customer-add-dialog/customer-add-dialog.component';

@Component({
	selector: 'app-enquiry',
	templateUrl: './enquiry.page.html',
	styleUrls: ['./enquiry.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnquiryPage {
	submitForm: FormGroup;

	//customerAdded = false;
	customerdata: any;

	removeRowArr = [];
	showDelIcon = false;
	// center_id: any;
	tabIndex = 0;

	userdata$: Observable<User>;
	userdata: any;

	isLoading = false;
	isCLoading = false;
	customername: any;
	address1: any;
	address2: any;
	district: any;
	gst: any;
	phone: any;
	whatsapp: any;

	iscustomerselected = false;
	clicked = false;
	@ViewChild('clist', { static: true }) clist: any;

	@ViewChild('myForm', { static: true }) myForm: NgForm;
	filteredCustomers: Observable<any[]>;

	// TAB navigation for product list
	@ViewChild('typehead', { read: MatAutocompleteTrigger })
	autoTrigger: MatAutocompleteTrigger;

	@ViewChild('plist', { static: true }) plist: any;
	@ViewChild('qty', { static: true }) qty: any;

	// TAB navigation for customer list
	@ViewChild('typehead1', { read: MatAutocompleteTrigger })
	autoTrigger1: MatAutocompleteTrigger;

	@ViewChild(IonContent, { static: false }) content: IonContent;

	customer_lis: Customer[];
	product_lis: Product[];

	selectedCustomerName: any;

	constructor(
		private _fb: FormBuilder,
		public dialog: MatDialog,
		public alertController: AlertController,
		private _modalcontroller: ModalController,
		private _router: Router,
		private _route: ActivatedRoute,
		private _cdr: ChangeDetectorRef,
		private _commonApiService: CommonApiService,
		private _dialog: MatDialog,
		private _authservice: AuthenticationService,
	) {
		this.basicinit();
		this.userdata$ = this._authservice.currentUser;
		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this._authservice.setCurrentMenu('ENQUIRY');
			this.userdata = data;

			this.submitForm.patchValue({
				center_id: data.center_id,
			});

			//    this.init();
			this._cdr.markForCheck();
		});

		this._route.params.subscribe((params) => {
			this.clicked = false;
			if (this.userdata !== undefined) {
				this.basicinit();
				this.init();
				this.submitForm.patchValue({
					center_id: this.userdata.center_id,
				});
			}
			this._cdr.markForCheck();
		});
	}

	basicinit() {
		this.submitForm = this._fb.group({
			customerctrl: [null, [Validators.required, RequireMatch]],

			productctrl: [null, [RequireMatch]],

			center_id: [null, Validators.required],
			remarks: [''],

			productarr: this._fb.array([]),

			tempdesc: [''],

			tempqty: ['1', [Validators.required, Validators.max(1000), Validators.min(1), Validators.pattern(/\-?\d*\.?\d{1,2}/)]],
		});
	}

	get productarr(): FormGroup {
		return this.submitForm.get('productarr') as FormGroup;
	}

	init() {
		this.clearInput();
		this.clearProdInput();
		this.searchCustomers();
		this.searchProducts();
		this._cdr.markForCheck();
	}

	searchCustomers() {
		let search = '';
		this.submitForm.controls['customerctrl'].valueChanges
			.pipe(
				debounceTime(300),
				tap(() => (this.isCLoading = true)),
				switchMap((id: any) => {
					search = id;
					if (id != null && id.length >= 2) {
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

	// ScrollToBottom() {
	//   this.content.scrollToBottom(1500);
	// }

	// ScrollToTop() {
	//   this.content.scrollToTop(1500);
	// }

	ScrollToPoint(X, Y) {
		this.content.scrollToPoint(X, Y, 300);
	}

	setCustomerInfo(event, from) {
		if (from === 'click' && event.option.value === 'new') {
			this.addCustomer();
		}
		this.iscustomerselected = true;
		this._cdr.detectChanges();

		if (from === 'tab') {
			this.customerdata = event;
		} else {
			this.customerdata = event.option.value;
			this.plist && this.plist.nativeElement.focus();
		}

		this._cdr.markForCheck();
	}

	addCustomer() {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '80%';
		dialogConfig.height = '80%';

		const dialogRef = this._dialog.open(CustomerAddDialogComponent, dialogConfig);

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
					this._commonApiService.getCustomerDetails(this.userdata.center_id, data.body.id).subscribe((custData: any) => {
						this.customerdata = custData[0];

						this.customername = custData[0].name;
						this.iscustomerselected = true;

						this.setCustomerInfo(custData[0], 'tab');

						this.submitForm.patchValue({
							customerctrl: custData[0],
						});

						this.isCLoading = false;
						this.autoTrigger1.closePanel();

						this._cdr.markForCheck();
					});
				} else {
					this.iscustomerselected = false;
					this.autoTrigger1.closePanel();

					this._cdr.markForCheck();
				}

				this._cdr.markForCheck();
			});
	}

	getLength() {
		const control = <FormArray>this.submitForm.controls['productarr'];
		return control.length;
	}

	searchProducts() {
		let search = '';
		this.submitForm.controls['productctrl'].valueChanges
			.pipe(
				debounceTime(300),
				tap(() => (this.isLoading = true)),
				switchMap((id: any) => {
					// console.log(id);
					search = id;
					if (id != null && id.length >= 2) {
						return this._commonApiService.getProductInfo({
							centerid: this.userdata.center_id,
							searchstring: id,
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

	initProduct() {
		return this._fb.group({
			checkbox: [false],
			product_code: [''],
			notes: ['', Validators.required],
			quantity: [1, [Validators.required, Validators.max(1000), Validators.min(1), Validators.pattern(/\-?\d*\.?\d{1,2}/)]],
		});
	}

	ngAfterViewInit() {
		this.searchCustomers();
		this.searchProducts();

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
						customerctrl: this.autoTrigger1.activeOption.value,
					});
					this.setCustomerInfo(this.autoTrigger1.activeOption.value, 'tab');
				}
			});

		setTimeout(() => {
			this.clist && this.clist.nativeElement.focus();
			this._cdr.detectChanges();
		});
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

	add() {
		if (this.submitForm.value.tempdesc === '' || this.submitForm.value.tempdesc === null) {
			this.submitForm.controls['tempdesc'].setErrors({ required: true });
			this.submitForm.controls['tempdesc'].markAsTouched();

			return false;
		}

		if (this.submitForm.value.tempqty === '' || this.submitForm.value.tempqty === null) {
			this.submitForm.controls['tempqty'].setErrors({ required: true });
			this.submitForm.controls['tempqty'].markAsTouched();

			return false;
		}

		const control = <FormArray>this.submitForm.controls['productarr'];

		// DnD insert adds new row in starting of the array {idx : 0}
		// control.insert(0, this._fb.group({

		control.push(
			this._fb.group({
				checkbox: [false],
				product_code: [this.submitForm.value.productctrl === null ? '' : this.submitForm.value.productctrl.product_code],

				notes: [this.submitForm.value.tempdesc, Validators.required],
				quantity: [
					this.submitForm.value.tempqty,
					[Validators.required, Validators.max(1000), Validators.min(1), Validators.pattern(/\-?\d*\.?\d{1,2}/)],
				],
			}),
		);

		this.submitForm.patchValue({
			productctrl: '',
			tempdesc: '',
			tempqty: 1,
		});

		this.submitForm.controls['tempdesc'].setErrors(null);
		this.submitForm.controls['tempqty'].setErrors(null);
		this.submitForm.controls['productctrl'].setErrors(null);
		this.plist && this.plist.nativeElement.focus();

		let v1 = 240 + control.length * 70 + 70;

		this.ScrollToPoint(0, v1);

		this._cdr.markForCheck();
	}

	filtercustomer(value: any) {
		if (typeof value == 'object') {
			return this.customer_lis.filter((customer) => customer.name.toLowerCase().match(value.name.toLowerCase()));
		} else if (typeof value == 'string') {
			return this.customer_lis.filter((customer) => customer.name.toLowerCase().match(value.toLowerCase()));
		}
	}

	clearInput() {
		this.submitForm.patchValue({
			customerctrl: null,
		});
		this.iscustomerselected = false;
		this.customer_lis = null;
		this.address1 = null;
		this.address2 = null;
		this.district = null;
		this.gst = null;
		this.phone = null;
		this.whatsapp = null;
		this.iscustomerselected = false;
		this._cdr.markForCheck();
	}

	clearProdInput() {
		this.submitForm.patchValue({
			productctrl: null,

			tempdesc: null,
			tempqty: 1,
		});
		this.product_lis = null;
		this._cdr.markForCheck();
	}

	onRemoveRows() {
		this.removeRowArr.sort(this.compare).reverse();
		this.removeRowArr.forEach((idx) => {
			this.onRemoveProduct(idx);
		});

		this.removeRowArr = [];
		this.delIconStatus();
	}

	compare(a: number, b: number) {
		return a - b;
	}

	onRemoveProduct(idx) {
		console.log('object ' + this.removeRowArr);
		(<FormArray>this.submitForm.get('productarr')).removeAt(idx);
	}

	checkedRow(idx: number, $event) {
		const faControl = (<FormArray>this.submitForm.controls['productarr']).at(idx);
		faControl['controls'].checkbox;

		if (faControl.value.checkbox) {
			this.removeRowArr.push(idx);
		} else {
			this.removeRowArr = this.removeRowArr.filter((e) => e !== idx);
		}
		this.delIconStatus();
		console.log('object..' + this.removeRowArr);
	}

	delIconStatus() {
		if (this.removeRowArr.length > 0) {
			this.showDelIcon = true;
		} else {
			this.showDelIcon = false;
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

	onSubmit() {
		if (this.getLength() == 0) {
			return this.presentAlert('No products added to save!');
		}

		if (!this.submitForm.valid) {
			return false;
		}

		//main submit
		this.clicked = true; // disable all buttons after submission
		this._cdr.markForCheck();
		this._commonApiService.saveEnquiry(this.submitForm.value).subscribe((data: any) => {
			console.log('object.SAVE ENQ. ' + JSON.stringify(data));

			if (data.body.result === 'success') {
				this.clearInput();
				this.clearProdInput();

				const control = <FormArray>this.submitForm.controls['productarr'];
				control.clear();

				this.submitForm.reset();
				this.myForm.resetForm();

				this.submitForm.patchValue({
					center_id: data.center_id,
				});

				this._router.navigate([`/home/enquiry/open-enquiry/O/weekly`]);
			} else {
			}

			this._cdr.markForCheck();
		});
	}

	reset() {
		this.clearInput();
		this.clearProdInput();

		const control = <FormArray>this.submitForm.controls['productarr'];
		control.clear();

		this.submitForm.reset();
		this.myForm.resetForm();
	}

	async presentAlertConfirm() {
		const alert = await this.alertController.create({
			header: 'Confirm!',
			message: 'Are you sure to clear Inquiry data? ',
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
					text: 'Yes, Proceed',
					handler: () => {
						console.log('Confirm Okay');

						this.reset();
					},
				},
			],
		});

		await alert.present();
	}

	openEnquiry() {
		this._router.navigateByUrl('/home/enquiry/open-enquiry/O/weekly');
	}

	openBackOrder() {
		this._router.navigateByUrl('/home/enquiry/back-order');
	}

	displayFn(obj: any): string | undefined {
		return obj && obj.name ? obj.name : undefined;
	}

	displayProdFn(obj: any): string | undefined {
		return obj && obj.product_code ? obj.product_code : undefined;
	}

	setItemDesc(event, from) {
		if (from === 'tab') {
			this.submitForm.patchValue({
				tempdesc: event.description,
			});
		} else {
			this.submitForm.patchValue({
				tempdesc: event.option.value.description,
			});
			this.qty && this.qty.nativeElement.focus();
		}

		this._cdr.markForCheck();
	}

	logScrolling(event) {
		if (this.autoTrigger1 && this.autoTrigger1.panelOpen) {
			this.autoTrigger1.closePanel();
		}

		if (this.autoTrigger && this.autoTrigger.panelOpen) {
			this.autoTrigger.closePanel();
		}
	}
}
