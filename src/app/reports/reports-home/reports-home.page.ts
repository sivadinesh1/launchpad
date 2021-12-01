import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
    selector: 'app-reports-home',
    templateUrl: './reports-home.page.html',
    styleUrls: ['./reports-home.page.scss'],
})
export class ReportsHomePage implements OnInit {
    constructor(
        private _router: Router,
        private _commonApiService: CommonApiService
    ) {}

    ngOnInit() {}

    getItemWiseReports() {
        this._router.navigate([`/home/reports/item-wise-sale-reports`]);
    }

    viewInventoryReports() {
        this._router.navigate(['home/reports/inventory-reports']);
    }

    viewProductSummaryReports() {
        this._router.navigate(['home/reports/product-summary-reports']);
    }

    openBackOrder() {
        this._router.navigateByUrl('/home/enquiry/back-order');
    }

    customerBalance() {
        this._router.navigate(['home/reports/customer-balance-reports']);
    }

    async exportCompletedPurchaseToExcel() {
        const fileName = `Full_Stock_List_${moment().format(
            'DD-MM-YYYY'
        )}.xlsx`;

        this._commonApiService
            .fetchFullProductInventoryReports('')
            .subscribe((report_data: any) => {
                const reportData = JSON.parse(JSON.stringify(report_data.body));

                const ws1: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);
                const wb1: xlsx.WorkBook = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(wb1, ws1, 'sheet1');

                //then add ur Title txt
                xlsx.utils.sheet_add_json(
                    wb1.Sheets.sheet1,
                    [
                        {
                            header:
                                'Full Stock Report on ' +
                                moment().format('DD-MM-YYYY'),
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
            });
    }
}
