import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { filter, tap } from 'rxjs/operators';
import { InventoryReportsDialogComponent } from 'src/app/components/reports/inventory-reports-dialog/inventory-reports-dialog.component';

@Component({
    selector: 'app-back-order',
    templateUrl: './back-order.page.html',
    styleUrls: ['./back-order.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackOrderPage implements OnInit {
    back_order_lst: any;

    constructor(
        private _commonApiService: CommonApiService,
        private _authService: AuthenticationService,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _dialog: MatDialog
    ) {}

    ngOnInit() {
        this._commonApiService.getBackOder().subscribe((data: any) => {
            this.back_order_lst = data;

            this._cdr.markForCheck();
        });
    }

    // productInfo(item) {
    //     if (item.product_code !== 'N/A') {
    //         this._router.navigate([
    //             `/home/view-product/${this.center_id}/${item.product_id}`,
    //         ]);
    //     }
    // }

    async showInventoryReportsDialog(item) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '1000px';
        dialogConfig.height = '100%';
        dialogConfig.data = {
            product_code: item.product_code,
            product_description: item.description,
            product_id: item.product_id,
        };
        dialogConfig.position = { top: '0', right: '0' };

        const dialogRef = this._dialog.open(
            InventoryReportsDialogComponent,
            dialogConfig
        );

        dialogRef
            .afterClosed()
            .pipe(
                filter((val) => !!val),
                tap(() => {
                    // do nothing
                })
            )
            .subscribe((data: any) => {
                // do nothing
            });
    }
}
