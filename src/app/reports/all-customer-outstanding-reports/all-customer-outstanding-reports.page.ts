import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/User';
import { CommonApiService } from '../../services/common-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, tap, map, startWith } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication.service';
import * as xlsx from 'xlsx';
import * as moment from 'moment';

@Component({
	selector: 'app-all-customer-outstanding-reports',
	templateUrl: './all-customer-outstanding-reports.page.html',
	styleUrls: ['./all-customer-outstanding-reports.page.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllCustomerOutstandingReportsPage implements OnInit {
	userdata$: Observable<User>;
	outstandingBalanceList: any;
	userdata: any;

	balance: any;

	constructor(
		private _authservice: AuthenticationService,
		private _commonApiService: CommonApiService,
		private _cdr: ChangeDetectorRef,
		private _router: Router,
	) {
		this.userdata$ = this._authservice.currentUser;
		this.userdata$.pipe(filter((data) => data !== null)).subscribe((data: any) => {
			this._authservice.setCurrentMenu('REPORTS');
			this.userdata = data;

			this.init();

			this._cdr.markForCheck();
		});
	}

	ngOnInit() {}

	init() {
		this.reloadOutstandingBalance();
	}

	reloadOutstandingBalance() {
		this._commonApiService.getOutstandingBalance({ center_id: this.userdata.center_id, limit: 0 }).subscribe((data: any) => {
			this.outstandingBalanceList = data.body;

			this.balance = this.outstandingBalanceList.reduce((total, e) => total + e.balance_amt, 0);

			this._cdr.markForCheck();
		});

		this._cdr.markForCheck();
	}

	downloadReport() {
		const fileName = 'all_customers_balance_Reports.xlsx';

		this.outstandingBalanceList.forEach((element) => {
			if (element.last_paid_date !== null) {
				element.last_paid_date = moment(element.last_paid_date).format('DD-MM-YYYY');
			}
		});

		let reportData = JSON.parse(JSON.stringify(this.outstandingBalanceList));

		reportData.forEach((e) => {
			e['Last Paid Date'] = e['last_paid_date'];
			delete e['last_paid_date'];

			e['Balance Amount'] = e['balance_amt'];
			delete e['balance_amt'];

			delete e['center_id'];
			delete e['createdon'];
			delete e['credit_amt'];
			delete e['email'];
			delete e['gst'];
			delete e['id'];
			delete e['inv_count'];
			delete e['isactive'];

			delete e['mobile'];
			delete e['mobile2'];
			delete e['panno'];
			delete e['phone'];
			delete e['pin'];
			delete e['pin'];
			delete e['state_id'];
			delete e['state_id'];
			delete e['tin'];
			delete e['tin'];
			delete e['whatsapp'];
			delete e['contact'];
		});

		const wb1: xlsx.WorkBook = xlsx.utils.book_new();
		//create sheet with empty json/there might be other ways to do this
		const ws1 = xlsx.utils.json_to_sheet([]);
		xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');
		//then add ur Title txt
		xlsx.utils.sheet_add_json(
			wb1.Sheets.sheet1,
			[
				{
					header: 'All Customers Balance Report',
				},
			],
			{
				skipHeader: true,
				origin: 'A1',
			},
		);
		//start frm A2 here
		xlsx.utils.sheet_add_json(wb1.Sheets.sheet1, reportData, {
			skipHeader: false,
			origin: 'A2',
		});
		xlsx.writeFile(wb1, fileName);
	}

	goCustomerFinancials(customer_id) {
		this._router.navigate([`/home/financials-customer/${this.userdata.center_id}/${customer_id}`]);
	}
}
