import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonApiService } from 'src/app/services/common-api.service';
import { CurrencyPadComponent } from 'src/app/components/currency-pad/currency-pad.component';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { ModalController, AlertController, IonSearchbar } from '@ionic/angular';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { InvoiceSuccessComponent } from 'src/app/components/invoice-success/invoice-success.component';
import { AddMoreEnquiryComponent } from 'src/app/components/add-more-enquiry/add-more-enquiry.component';
import { filter, tap, catchError, debounceTime, switchMap } from 'rxjs/operators';
import * as xlsx from 'xlsx';
import { NgxSpinnerService } from 'ngx-spinner';

import { MatSort } from '@angular/material/sort';
import { Observable, empty, of } from 'rxjs';
import { NgForm, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Customer } from 'src/app/models/Customer';
import { CustomerAddDialogComponent } from 'src/app/components/customers/customer-add-dialog/customer-add-dialog.component';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { CustomerViewDialogComponent } from 'src/app/components/customers/customer-view-dialog/customer-view-dialog.component';
import { RequireMatch } from 'src/app/util/directives/requireMatch';
import { User } from 'src/app/models/User';
import { SuccessMessageDialogComponent } from './../../components/success-message-dialog/success-message-dialog.component';
import { Product } from 'src/app/models/Product';
import { ProductAddDialogComponent } from './../../components/products/product-add-dialog/product-add-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IonContent } from '@ionic/angular';

@Component({
	selector: 'app-process-enquiry',
	templateUrl: './process-enquiry.page.html',
	styleUrls: ['./process-enquiry.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessEnquiryPage implements OnInit {
	submitForm: FormGroup;
	submitForm1: FormGroup;

	enqDetailsOrig: any = [];
	selectedEnq: any;

	pageLength: any;

	customer_lis: Customer[];

	enqid: any;
	selected_description = '';
	selected_mrp = '';
	lineItemData: any;

	status: any;
	isTableHasData = true;

	isLoading = false;
	isCLoading = false;
	customername: any;
	customerdata: any;

	searchText = '';

	showDelIcon = false;

	iscustomerselected = false;
	productList$: Observable<any>[] = [];

	product_lis: Product[];

	@ViewChild('myForm1', { static: true }) myForm1: NgForm;

	@ViewChild('epltable', { static: false }) epltable: ElementRef;

	// TAB navigation for customer list
	@ViewChild('typehead1', { read: MatAutocompleteTrigger })
	autoTrigger1: MatAutocompleteTrigger;

	@ViewChildren('typehead', { read: MatAutocompleteTrigger })
	autoTriggerList: QueryList<MatAutocompleteTrigger>;

	@ViewChildren('typehead2', { read: MatAutocompleteTrigger })
	autoTrigger2: QueryList<MatAutocompleteTrigger>;

	@ViewChildren(MatAutocompleteTrigger)
	autocompletes: QueryList<MatAutocompleteTrigger>;

	@ViewChild('qty', { static: true }) qty: any;
	@ViewChild(IonContent, { static: false }) content: IonContent;
	@ViewChild('plist', { static: true }) plist: any;

	userdata$: Observable<User>;
	userdata: any;
	ready = 0;

	clicked = false;
	removeRowArr = [];
	deletedRowArr = [];

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private dialog: MatDialog,
		private _modalcontroller: ModalController,
		private _authservice: AuthenticationService,
		public alertController: AlertController,
		private _commonApiService: CommonApiService,
		private _dialog: MatDialog,
		private _fb: FormBuilder,
		private _fb1: FormBuilder,
		private spinner: NgxSpinnerService,
		private _cdr: ChangeDetectorRef,
		private _snackBar: MatSnackBar,
	) {
		this.init();
		this.userdata$ = this._authservice.currentUser;
		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this.userdata = data;
			this.ready = 1;

			this._route.params.subscribe((params) => {
				this.clicked = false;
				this.enqid = params['enqid'];

				this.submitForm1.patchValue({
					enquiry_id: params['enqid'],
					centerid: this.userdata.center_id,
					createdby: this.userdata.userid,
				});

				this.submitForm.patchValue({
					createdby: this.userdata.userid,
				});

				this.enqDetailsOrig = [];
				this.reloadEnqDetails('');
				this._cdr.markForCheck();
			});

			this._cdr.markForCheck();
		});
	}

	get enquiries(): FormArray {
		return this.submitForm.get('enquiries') as FormArray;
	}

	ngOnInit() {
		this.spinner.show();
	}

	init() {
		this.submitForm = this._fb.group({
			customerctrl: [null, [Validators.required, RequireMatch]],
			enquiries: this._fb.array([]),
			createdby: [],
		});

		this.submitForm1 = this._fb1.group({
			enquiry_id: ['', Validators.required],

			centerid: [''],
			productctrl: [null, [Validators.required, RequireMatch]],
			remarks: [''],

			tempdesc: [''],

			tempqty: ['1', [Validators.required, Validators.max(1000), Validators.min(1), Validators.pattern(/\-?\d*\.?\d{1,2}/)]],
			createdby: [],
		});

		this.searchProducts();
		this.searchCustomers();
	}

	searchProducts() {
		let search = '';
		this.submitForm1.controls['productctrl'].valueChanges
			.pipe(
				debounceTime(300),
				tap(() => (this.isLoading = true)),
				switchMap((id: any) => {
					search = id;
					if (id != null && id.length >= 0) {
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

	reloadEnqDetails(type) {
		this.enqDetailsOrig = [];
		this._commonApiService.getEnquiryDetails(this.enqid).subscribe((data: any) => {
			this.enqDetailsOrig = data;

			this._commonApiService
				.getCustomerDetails(this.userdata.center_id, this.enqDetailsOrig.customerDetails[0].customer_id)
				.subscribe((custData: any) => {
					this.customerdata = custData[0];

					this.submitForm.patchValue({
						customerctrl: custData[0],
					});

					this.customername = custData[0].name;
					this.iscustomerselected = true;
				});

			this.status = this.enqDetailsOrig.customerDetails[0].estatus;

			this.populateEnquiry(this.enqDetailsOrig?.enquiryDetails);

			this.spinner.hide();

			if (type === 'loadingnow') {
				let v1 = 220 + this.enqDetailsOrig?.enquiryDetails.length * 70 + 70;
				this.ScrollToPoint(0, v1);
			} else {
				this.ScrollToTop();
			}

			this._cdr.markForCheck();
		});
	}

	populateEnquiry(enqList) {
		this.enquiries.clear();

		enqList.forEach((element, index) => {
			let tmpGiveqty = 0;
			// status (D) do not manipulate. default entered give qty
			if (element.status === 'D') {
				tmpGiveqty = element.giveqty === 0 ? 0 : element.giveqty;
			} else {
				// tmpGiveqty = element.askqty;
				// When status is Open (O)
				// if available stock is zero, then defaults value to 0
				tmpGiveqty = element.available_stock <= 0 ? 0 : element.askqty;
			}

			this.enquiries.push(this.addProductGroup(element, tmpGiveqty, index));
			this._cdr.detectChanges();
		});

		this.autoTriggerList &&
			this.autoTriggerList.forEach((e, idx) => {
				e.panelClosingActions.subscribe((x) => {
					if (this.autoTriggerList.toArray()[idx].activeOption) {
						this.setItemDesc(this.autoTriggerList.toArray()[idx].activeOption.value, idx, 'tab');
					}
					console.log('is it calling..' + JSON.stringify(x));
				});
			});
	}

	addProductGroup(element, tmpGiveqty, index) {
		const group = this._fb.group({
			id: element.id,
			enquiry_id: element.enquiry_id,
			notes: element.notes,
			askqty: element.askqty,
			giveqty: tmpGiveqty,
			status: 'P',
			invoiceno: element.invoiceno,
			center_id: this.userdata.center_id,
			customer_id: element.customer_id,
			product_id: element.product_id,
			product_code: element.pcode,
			product_desc: element.pdesc,
			rackno: element.rackno,
			qty: element.packetsize,
			packetsize: element.packetsize,
			unit_price: element.unit_price,
			mrp: element.mrp,
			available_stock: element.available_stock,
			stockid: element.stock_pk,
			processed: element.processed,
			check_box: false,
		});

		this.productList$[index] = group.get('product_code').valueChanges.pipe(
			debounceTime(300),

			switchMap((value) => {
				return this._commonApiService.getProductInfo1({
					centerid: this.userdata.center_id,
					searchstring: value,
				});
			}),
		);
		return group;
	}

	searchCustomers() {
		//let search = '';
		this.submitForm.controls['customerctrl'].valueChanges
			.pipe(
				debounceTime(300),
				tap(() => (this.isCLoading = true)),
				switchMap((id: any) => {
					console.log(id);
					//		search = id;
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

	displayFn(obj: any): string | undefined {
		return obj && obj.name ? obj.name : undefined;
	}

	setCustomerInfo(event, from) {
		if (from === 'click' && event.option.value === 'new') {
			this.addCustomer();
		}

		if (from === 'tab') {
			this.customerdata = event;
			this.iscustomerselected = true;
		} else {
			this.customerdata = event.option.value;

			this.iscustomerselected = true;
		}

		this._cdr.markForCheck();
	}

	clearInput() {
		this.submitForm.patchValue({
			customerctrl: null,
		});

		this.iscustomerselected = false;

		this._cdr.markForCheck();
	}

	clearProdInput(index) {
		this.enquiries.controls[index].patchValue({
			product_id: null,
			product_code: null,
			product_desc: null,
			available_stock: null,
			giveqty: 0,
		});

		this._cdr.markForCheck();
	}

	clearProdInput1() {
		this._cdr.markForCheck();
	}

	async presentAlert(msg: string) {
		const alert = await this.alertController.create({
			header: 'Alert',

			message: msg,
			buttons: ['OK'],
		});

		await alert.present();
	}

	save(param) {
		if (!this.iscustomerselected) {
			this.presentAlert('Select customer to proceed !!!');
			return false;
		}

		this.executeDeletes();

		if (this.enqDetailsOrig.customerDetails[0].customer_id !== this.customerdata.id) {
			this.updateCustomerDetailsinEnquiry();
		}

		if (!this.submitForm.valid) {
			this.presentAlert('Form incomplete, Verify if any missing entries !!!');
			return false;
		}

		//main submit
		this.clicked = true; // disable all buttons after submission
		this._cdr.markForCheck();
		this.spinner.show();

		if (this.submitForm.value.enquiries.length === 0) {
			this.presentAlert('Nothing to save, add cart before saving!');
			this.spinner.hide();
			return false;
		}

		this._commonApiService.draftEnquiry(this.submitForm.value.enquiries).subscribe((data: any) => {
			this.spinner.hide();
			if (data.body.result === 'success') {
				if (param === 'additem') {
					this.clicked = false;
					//	this.openAddItem();
				} else {
					this._router.navigate([`/home/enquiry/open-enquiry/O/weekly`]);
				}
			} else {
			}

			this._cdr.markForCheck();
		});
	}

	displayProdFn(obj: any): string | undefined | any {
		return obj && obj.product_code ? obj.product_code : obj;
	}

	onClick(selItem) {
		this.selectedEnq = selItem.id;
	}

	isSelected(item) {
		if (item.id === this.selectedEnq) {
			return 'grey';
		}
	}

	checkedRow(idx) {
		setTimeout(() => {
			if (this.enquiries.controls[idx].value.processed === 'YS') {
				this.enquiries.controls[idx].patchValue({
					processed: 'NO',
				});
			} else if (this.enquiries.controls[idx].value.processed === 'NO') {
				this.enquiries.controls[idx].patchValue({
					processed: 'YS',
				});
			}

			this._cdr.markForCheck();

			this._cdr.detectChanges();
		}, 10);
	}

	checkedDelRow(idx: number) {
		if (!this.enquiries.controls[idx].value.check_box) {
			this.enquiries.controls[idx].value.check_box = true;
			this.removeRowArr.push(idx);
		} else if (this.enquiries.controls[idx].value.check_box) {
			this.enquiries.controls[idx].value.check_box = false;
			this.removeRowArr = this.removeRowArr.filter((e) => e !== idx);
		}
		this.delIconStatus();
	}

	moveToSale() {
		if (!this.iscustomerselected) {
			this.presentAlert('Select customer to proceed !!!');
			return false;
		}

		if (this.enqDetailsOrig.customerDetails[0].customer_id !== this.customerdata.id) {
			this.updateCustomerDetailsinEnquiry();
		}

		//main (2) secondary button submit
		this.clicked = true; // disable all buttons after submission
		this._cdr.markForCheck();
		this.spinner.show();

		let formToMoveSale = {
			enquries: this.submitForm.value.enquiries,
			userid: this.userdata.userid,
		};

		this._commonApiService.moveToSale(formToMoveSale).subscribe((data: any) => {
			this.spinner.hide();
			if (data.body.result === 'success') {
				this._router.navigate([`/home/enquiry/open-enquiry/O/weekly`]);
			} else {
			}

			this._cdr.markForCheck();
		});
	}

	updateCustomerDetailsinEnquiry() {
		this._commonApiService.updateCustomerDetailsinEnquiry(this.customerdata.id, this.enqid).subscribe((data: any) => {
			if (data.body.result === 'success') {
				// do nothing
			}
		});
	}

	openEnquiry() {
		this._router.navigateByUrl(`/home/enquiry/open-enquiry/O/weekly`);
	}

	goEnquiryScreen() {
		this._router.navigateByUrl(`/home/enquiry`);
	}

	async presentAlertConfirm() {
		let atleastOneValidEntry = this.submitForm.value.enquiries.filter((e) => {
			return e.giveqty !== 0;
		});

		if (atleastOneValidEntry.length === 0) {
			// attn move all to backorder to be implemented
			this.moveToSaleFinalConfirm('Only Backorders, Nothing to move to sale. Continue?', 'Continue');
		} else {
			this.moveToSaleFinalConfirm('Are you sure, Orders processing completed?', 'Yes, Move to Sale');
		}

		// const alert = await this.alertController.create({
		// 	header: 'Confirm!',
		// 	message: 'Are you sure, Orders processing completed?',
		// 	buttons: [
		// 		{
		// 			text: 'Cancel',
		// 			role: 'cancel',
		// 			cssClass: 'secondary',
		// 			handler: (blah) => {
		// 				console.log('Confirm Cancel: blah');
		// 			},
		// 		},
		// 		{
		// 			text: 'Yes, Move to Sale',
		// 			handler: () => {
		// 				console.log('Confirm Okay');
		// 				this.executeDeletes();
		// 				this.moveToSale();
		// 			},
		// 		},
		// 	],
		// });

		// await alert.present();
	}

	async moveToSaleFinalConfirm(param, action) {
		const alert = await this.alertController.create({
			header: 'Confirm!',
			message: param,
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
					text: action,
					handler: () => {
						console.log('Confirm Okay');
						this.executeDeletes();
						this.moveToSale();
					},
				},
			],
		});

		await alert.present();
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

	executeDeletes() {
		this.deletedRowArr.sort().reverse();
		this.deletedRowArr.forEach((e) => {
			this.executeDeleteProduct(e);
		});
	}

	executeDeleteProduct(elem) {
		this._commonApiService
			.deleteEnquiryDetails({
				id: elem.id,
				enquiry_id: elem.enquiry_id,
				qty: elem.askqty,
				product_id: elem.product_id,
				notes: elem.notes,
				autidneeded: true,
			})
			.subscribe((data: any) => {
				if (data.body.result === 'success') {
					console.log('object >>> execute delete product ...');
				} else {
					this.spinner.hide();
					this.presentAlert('Error: Something went wrong Contact Admin!');
				}

				this._cdr.markForCheck();
			});

		this._cdr.markForCheck();
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

	deleteProduct(idx) {
		if (this.enquiries.controls[idx].value.id !== '') {
			this.deletedRowArr.push(this.enquiries.controls[idx].value);
		}

		this.enquiries.removeAt(idx);

		this.removeRowArr = this.removeRowArr.filter((e) => e !== idx);

		this.delIconStatus();

		this._cdr.markForCheck();
	}

	delIconStatus() {
		if (this.removeRowArr.length > 0) {
			this.showDelIcon = true;
		} else {
			this.showDelIcon = false;
		}
	}

	async beforeAddItemConfirm() {
		const alert = await this.alertController.create({
			header: 'Confirm!',
			message: 'Recent changes will be draft saved before add items.',
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
					text: 'Yes, go ahead',
					handler: () => {
						console.log('Confirm Okay');
						this.save('additem');
					},
				},
			],
		});

		await alert.present();
	}

	// openAddItem() {
	// 	const dialogConfig = new MatDialogConfig();
	// 	dialogConfig.disableClose = true;
	// 	dialogConfig.autoFocus = true;
	// 	dialogConfig.width = '80%';
	// 	dialogConfig.height = '80%';
	// 	dialogConfig.data = {
	// 		enquiry_id: this.enqid,
	// 		center_id: this.userdata.center_id,
	// 		customer_id: this.enqDetailsOrig.customerDetails[0].customer_id,
	// 	};

	// 	const dialogRef = this.dialog.open(AddMoreEnquiryComponent, dialogConfig);

	// 	dialogRef
	// 		.afterClosed()
	// 		.pipe(
	// 			filter((val) => !!val),
	// 			tap((val) => {
	// 				this.init();
	// 				this.reloadEnqDetails();
	// 				this._cdr.markForCheck();
	// 				this.clicked = false;
	// 			})
	// 		)
	// 		.subscribe();
	// }

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

	openDialog(event): void {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		dialogConfig.width = '400px';
		dialogConfig.height = '100%';
		dialogConfig.data = this.customerdata;
		dialogConfig.position = { top: '0', right: '0' };

		const dialogRef = this._dialog.open(CustomerViewDialogComponent, dialogConfig);

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
		});
	}

	reset() {}

	ngAfterViewInit() {
		this.autoTrigger1 &&
			this.autoTrigger1.panelClosingActions.subscribe((x) => {
				if (this.autoTrigger1.activeOption) {
					this.submitForm.patchValue({
						customerctrl: this.autoTrigger1.activeOption.value,
					});
					this.setCustomerInfo(this.autoTrigger1.activeOption.value, 'tab');
				}
			});
	}

	exportToExcel() {
		const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(this.epltable.nativeElement);
		ws['!cols'] = [];
		ws['!cols'][1] = { hidden: true };
		ws['!cols'][4] = { hidden: true };

		const wb: xlsx.WorkBook = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
		xlsx.writeFile(wb, 'epltable.xlsx');
	}

	logScrolling(event) {
		if (this.autoTrigger1 && this.autoTrigger1.panelOpen) {
			this.autoTrigger1.closePanel();
		}
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
						//main cancel
						this.clicked = true; // disable all buttons after submission
						this._cdr.markForCheck();
						this._router.navigateByUrl('/home/enquiry/open-enquiry/O/weekly');
					},
				},
			],
		});

		await alert.present();
	}

	setItemDesc(event, index, from) {
		if (from === 'click') {
			this.populateFormValues(index, event.option.value);
		} else {
			this.populateFormValues(index, event);
		}

		this._cdr.markForCheck();
		this._cdr.detectChanges();
	}

	populateFormValues(index, formObject) {
		this.enquiries.controls[index].patchValue({
			product_id: formObject.product_id,
			product_code: formObject.product_code,
			product_desc: formObject.description,
			qty: formObject.packetsize,
			packetsize: formObject.packetsize,
			unit_price: formObject.unit_price,
			mrp: formObject.mrp,
			status: 'P',
			stockid: formObject.stock_pk,
			available_stock: formObject.available_stock,
			rackno: formObject.rackno,
		});
	}

	// enquiry_id: [this.enqid, Validators.required],
	// 		customer: ['', Validators.required],
	// 		centerid: ['', Validators.required],
	// 		productctrl: [null, [RequireMatch]],
	// 		remarks: [''],

	// 		tempdesc: [''],
	// 		tempmrp: [''],

	// 		tempqty: [
	// 			'1',

	// 		],

	// 		productarr: this._fb.array([]),
	// enquiry_id, product_id, askqty, product_code, notes, status

	onSubmit() {
		// if (!this.submitForm1.valid) {
		// 	return false;
		// }

		let form = {
			center_id: this.userdata.center_id,
			enquiry_id: +this.enqid,

			askqty: this.submitForm1.value.tempqty,
			product_code: this.submitForm1.value.productctrl.product_code,
			notes: this.submitForm1.value.tempdesc,
			status: 'O',
			created_by: this.userdata.userid,
		};

		this._commonApiService.addMoreEnquiry(form).subscribe((data: any) => {
			this.submitForm1.reset();
			this.myForm1.resetForm();
			this.submitForm1.patchValue({
				enquiry_id: this.enqid,
				centerid: this.userdata.center_id,
			});
			this.reloadEnqDetails('loadingnow');
			this.plist && this.plist.nativeElement.focus();
			this.openSnackBar('Item added to Order queue', '');

			this._cdr.markForCheck();
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

	setItemDesc1(event, from) {
		if (from === 'tab') {
			this.submitForm1.patchValue({
				tempdesc: event.description,
				tempqty: event.qty === 0 ? 1 : event.qty,
			});
			this.lineItemData = event;
			this.selected_description = event.description;
			this.selected_mrp = event.mrp;

			//this.qty && this.qty.nativeElement.focus();
		} else {
			this.submitForm1.patchValue({
				tempdesc: event.option.value.description,
				tempqty: event.option.value.qty === 0 ? 1 : event.option.value.qty,
			});
			this.lineItemData = event.option.value;
			this.selected_description = event.option.value.description;
			this.selected_mrp = event.option.value.mrp;
			this.qty && this.qty.nativeElement.focus();
		}

		this._cdr.markForCheck();
	}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', 'mat-primary'],
		});
	}

	ScrollToPoint(X, Y) {
		this.content.scrollToPoint(X, Y, 300);
	}

	ScrollToTop() {
		this.content.scrollToTop(1500);
	}
}
