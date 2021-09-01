import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from 'src/app/models/Customer';
import { User } from 'src/app/models/User';
import { IonSearchbar } from '@ionic/angular';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonApiService } from 'src/app/services/common-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-ledger-customer',
  templateUrl: './ledger-customer.page.html',
  styleUrls: ['./ledger-customer.page.scss'],
})
export class LedgerCustomerPage implements OnInit {


  center_id: any;
  // customer$: Observable<Customer[]>;
  userdata$: Observable<User>;
  userdata: any;
  isTableHasData = true;

  ready = 0;
  pcount: any;
  noMatch: any;
  responseMsg: string;
  pageLength: any;

  resultsize = 0;
  customerslist: any;
  customersOriglist: any;

  @ViewChild('mySearchbar', { static: true }) searchbar: IonSearchbar;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('epltable', { static: false }) epltable: ElementRef;


  displayedColumns: string[] = ['name', 'address1', 'actions'];
  dataSource = new MatTableDataSource<Customer>();

  constructor(private _authservice: AuthenticationService, private _cdr: ChangeDetectorRef,
    private _dialog: MatDialog,
    private _commonApiService: CommonApiService, private _route: ActivatedRoute,
    private _router: Router,) {

    this.userdata$ = this._authservice.currentUser;

    this.userdata$
      .pipe(
        filter((data) => data !== null))
      .subscribe((data: any) => {
        this.center_id = data.center_id;
        this.ready = 1;
        this.reloadCustomerLedger();
        this._cdr.markForCheck();
      });

    this._route.params.subscribe(params => {
      this.init();
    });


  }


  init() {
    if (this.ready === 1) { this.reloadCustomerLedger(); }
  }

  reloadCustomerLedger() {

    // this._commonApiService.getLedgerCustomer(this.center_id, this.customer_id).subscribe(
    //   (data: any) => {
    //     // DnD - code to add a "key/Value" in every object of array
    //     this.dataSource.data = data.map(el => {
    //       var o = Object.assign({}, el);
    //       o.isExpanded = false;
    //       return o;
    //     })

    //     this.dataSource.sort = this.sort;
    //     this.pageLength = data.length;

    //   });
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;

  }



}


