import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { User } from "../../models/User";

import { IonSearchbar } from '@ionic/angular';
import * as xlsx from 'xlsx';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { WhatsappDialogComponent } from 'src/app/components/social/whatsapp/whatsapp-dialog/whatsapp-dialog.component';

@Component({
  selector: 'app-product-summary-reports',
  templateUrl: './product-summary-reports.page.html',
  styleUrls: ['./product-summary-reports.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSummaryReportsPage implements OnInit {


  throttle = 300;
  scrollDistance = 10;
  scrollUpDistance = 20;

  center_id: any;
  resultList: any;

  pageLength = 0;
  isTableHasData = true;
  productArr: any;

  start = 0;
  rowsperpage = 100;

  userdata$: Observable<User>;
  ready = 0; // flag check - centerid (localstorage) & customerid (param)

  @ViewChild('epltable', { static: false }) epltable: ElementRef;

  @ViewChild('mySearchbar', { static: true }) searchbar: IonSearchbar;

  displayedColumns: string[] = ['brandname', 'code', 'description', 'hsncode', 'available_stock', 'mrp', 'tax_rate', 'rakno', 'last_updated'];


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

  constructor(private _authservice: AuthenticationService, private _cdr: ChangeDetectorRef,
    private _commonApiService: CommonApiService, private _dialog: MatDialog,
    private _route: ActivatedRoute,
    private _router: Router,) {

    this.userdata$ = this._authservice.currentUser;
    this.userdata$
      .pipe(
        filter((data) => data !== null))
      .subscribe((data: any) => {
        this.center_id = data.center_id;
        this.ready = 1;
        this.reloadProductSummaryReport(false, "");
        this._cdr.markForCheck();
      });

    this._route.params.subscribe(params => {
      this.init();
    });

    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this._filter(fruit) : this.allFruits.slice()));

  }


  init() {
    if (this.ready === 1) {  // ready = 1 only after userdata observable returns 
      this.reloadProductSummaryReport(false, "");
    }
  }



  reset() {

  }

  ngOnInit() {

  }


  reloadProductSummaryReport(isFirstLoad, event) {

    this._commonApiService.fetchProductSummaryReports(
      { "center_id": this.center_id, "start": this.start, "end": this.start + this.rowsperpage })
      .subscribe((data: any) => {

        this.productArr = data.body;

        if (isFirstLoad)
          event.target.complete();

        this.start = this.start + this.rowsperpage;
        this._cdr.markForCheck();

      });


  }

  exportToExcel() {

    const ws: xlsx.WorkSheet =
      xlsx.utils.table_to_sheet(this.epltable.nativeElement);
    ws['!cols'] = [];
    // ws['!cols'][1] = { hidden: true };
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    xlsx.writeFile(wb, 'epltable.xlsx');
  }

  doInfinite(event) {
    this.reloadProductSummaryReport(true, event);
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.fruits.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.fruitCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.openShareDialog();

    // this.fruits.push(event.option.viewValue);
    // this.fruitInput.nativeElement.value = '';
    // this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }

  openShareDialog(): void {
    const dialogRef = this._dialog.open(WhatsappDialogComponent, {
      width: '250px',
      data: { whatsapp: '9999999999' }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

    });
  }

}

// dialogRef = this.dialogService.openDialog({
//   positionRelativeToElement: this.myButtonRef,
//   has_backdrop: true
// })

// (click)="openShareDialog()"