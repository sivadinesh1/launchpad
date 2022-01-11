import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewChild,
} from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { IonSearchbar, ModalController } from '@ionic/angular';

@Component({
    selector: 'app-add-product',
    templateUrl: './add-product.component.html',
    styleUrls: ['./add-product.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProductComponent implements OnInit {
    @ViewChild('mySearchbar', { static: true }) searchbar: IonSearchbar;
    resultList: any;
    noMatch: any;

    customer_id;
    center_id;
    order_date;

    constructor(
        private _commonApiService: CommonApiService,
        private _modalcontroller: ModalController,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {}

    ionViewDidEnter() {
        this.searchbar.setFocus();
    }

    openDialog(search_text): void {
        if (search_text.length > 2) {
            if (this.customer_id === 0) {
                this._commonApiService
                    .getProductInfo({
                        center_id: this.center_id,
                        search_text,
                    })
                    .subscribe((data) => {
                        this.resultList = data.body;

                        if (this.resultList.length === 0) {
                            this.noMatch = 'No Matching Records';
                            this._cdr.markForCheck();
                        } else if (this.resultList.length > 0) {
                            this.noMatch = '';
                            this._cdr.markForCheck();
                        }
                    });
            } else {
                this._commonApiService
                    .getProductInformation({
                        center_id: this.center_id,
                        customerid: this.customer_id,
                        orderdate: this.order_date,
                        search_text: search_text,
                    })
                    .subscribe((data) => {
                        this.resultList = data.body;

                        if (this.resultList.length === 0) {
                            this.noMatch = 'No Matching Records';
                            this._cdr.markForCheck();
                        } else if (this.resultList.length > 0) {
                            this.noMatch = '';
                            this._cdr.markForCheck();
                        }
                    });
            }
        }
    }

    reset() {
        this.searchbar.value = '';
        this.noMatch = '';
        this.resultList = null;
    }

    async addProduct(item) {
        await this._modalcontroller.dismiss(item);
    }

    closeModal() {
        this._modalcontroller.dismiss();
    }
}
