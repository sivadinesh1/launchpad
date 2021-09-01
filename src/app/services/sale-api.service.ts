import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { errorApiUrl } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import * as FileSaver from 'file-saver';
import { Purchase } from '../models/Purchase';
import { Sales } from '../models/Sales';
import { Customer } from '../models/Customer';
import { Vendor } from '../models/Vendor';
import { EnquiryDetail } from '../models/EnquiryDetail';
import { Enquiry } from '../models/Enquiry';

@Injectable({
    providedIn: 'root'
})
export class SaleApiService {
    restApiUrl = environment.restApiUrl;
    errorApiUrl = errorApiUrl;

    constructor(private httpClient: HttpClient) { }


    getNxtSaleInvoiceNo(centerid, invoicetype) {
        return this.httpClient.get(`${this.restApiUrl}/api/sale/get-next-sale-invoice-no/${centerid}/${invoicetype}`);
    }

}