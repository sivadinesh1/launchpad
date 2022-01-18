import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
    HttpClient,
    HttpParams,
    HttpHeaders,
    HttpResponse,
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse,
} from '@angular/common/http';
import { errorApiUrl } from 'src/environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { map, shareReplay, retry, catchError } from 'rxjs/operators';

import * as FileSaver from 'file-saver';
import { Purchase } from '../models/Purchase';
import { Sale } from '../models/Sale';
import { Customer } from '../models/Customer';
import { Vendor } from '../models/Vendor';
import { EnquiryDetail } from '../models/EnquiryDetail';
import { Enquiry } from '../models/Enquiry';
import { Brand } from '../models/Brand';
import { DashboardPage } from '../dashboard/dashboard.page';
import { IProduct } from '../models/Product';
import { IStock } from '../models/Stock';
import { IProductSearchDto } from '../dto/product-search.dto';

@Injectable({
    providedIn: 'root',
})
export class CommonApiService {
    restApiUrl = environment.restApiUrl;
    errorApiUrl = errorApiUrl;

    constructor(private httpClient: HttpClient) {}

    getStates() {
        return this.httpClient.get(
            this.restApiUrl + '/v1/api/admin/get-states'
        );
    }

    getTimezones() {
        return this.httpClient.get(
            this.restApiUrl + '/v1/api/admin/get-timezones'
        );
    }

    getAllPartsStockData() {
        return this.httpClient.get(this.restApiUrl + '/v1/api/inventory/all');
    }

    viewProductInfo(product_id: string) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/view-product-info/${product_id}`
        );
    }

    viewProductsCount() {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/view-products-count`
        );
    }

    getProductInfo(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/search-product`,
            submitForm,
            { observe: 'response' }
        );
    }
    // map(heroes => heroes[0])
    getProductInfo1(submitForm): Observable<any> {
        return this.httpClient
            .post(`${this.restApiUrl}/v1/api/search-product`, submitForm, {
                observe: 'response',
            })
            .pipe(map((res: any) => res.body));
    }

    getProductInformation(submitForm) {
        return this.httpClient
            .post(
                `${this.restApiUrl}/v1/api/search-product-information`,
                submitForm,
                { observe: 'response' }
            )
            .pipe(map((res: any) => res.body));
    }

    getCustomerInfo(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/search-customer`,
            submitForm,
            { observe: 'response' }
        );
    }

    getVendorInfo(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/search-vendor`,
            submitForm,
            { observe: 'response' }
        );
    }

    getBrandInfo(submitForm: any) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/search-brand`,
            submitForm,
            { observe: 'response' }
        );
    }

    getOpenEnquiries(status: string) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/enquiry/open-enquiries/${status}`
        );
    }

    getAllActiveVendors(): Observable<Vendor[]> {
        return this.httpClient
            .get<Vendor[]>(`${this.restApiUrl}/v1/api/all-active-vendors`)
            .pipe(catchError((err) => of([])));
    }

    getAllActiveVendorsPost(submitObject) {
        return this.httpClient.post(
            this.restApiUrl + '/v1/api/all-active-vendors',
            submitObject,
            { observe: 'response' }
        );
    }

    getAllActiveBrands(status): Observable<Brand[]> {
        return this.httpClient.get<Brand[]>(
            `${this.restApiUrl}/v1/api/all-active-brands/${status}`
        );
    }

    getAllActiveBrandsPost(submitObject) {
        return this.httpClient.post(
            this.restApiUrl + '/v1/api/all-active-brands',
            submitObject,
            { observe: 'response' }
        );
    }

    getAllActivePaymentModes(status): Observable<any> {
        return this.httpClient.get<Brand[]>(
            `${this.restApiUrl}/v1/api/all-payment-modes/${status}`
        );
    }

    getAllActiveCustomers() {
        return this.httpClient.get(
            this.restApiUrl + '/v1/api/all-active-customers'
        );
    }

    getAllActiveCustomersPost(submitObject) {
        return this.httpClient.post(
            this.restApiUrl + '/v1/api/all-active-customers',
            submitObject,
            { observe: 'response' }
        );
    }

    getEnquiryDetails(enqid: string) {
        return this.httpClient.get(
            this.restApiUrl + '/v1/api/enquiry/get-enquiry-details/' + enqid
        );
    }

    getEnquiryMaster(enqid: string) {
        return this.httpClient.get(
            this.restApiUrl + '/v1/api/enquiry/get-enquiry-master/' + enqid
        );
    }

    saveEnquiry(enqObj) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/enquiry/insert-enquiry-details/',
            enqObj,
            { observe: 'response' }
        );
    }

    addMoreEnquiry(enqObj) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/enquiry/add-more-enquiry-details/',
            enqObj,
            { observe: 'response' }
        );
    }

    updateEnquiryDetails(enqDetailObj) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/enquiry/update-enquiry-details/',
            enqDetailObj,
            { observe: 'response' }
        );
    }

    // updatePoductIdEnquiryDetails(productid, status, enqdetailid, stockid) {

    //   let body: HttpParams = new HttpParams();
    //   body = body.append('productid', productid);
    //   body = body.append('status', status);
    //   body = body.append('enqdetailid', enqdetailid);
    //   body = body.append('stockid', stockid);

    //   return this.httpClient.post<any>(this.restApiUrl + '/api/enquiry/update-productinfo-enquiry-details', body, { observe: 'response' });
    // }

    // updateGiveqtyEnquiryDetails(giveqty, enqdetailid) {

    //   let body: HttpParams = new HttpParams();
    //   body = body.append('giveqty', giveqty);
    //   body = body.append('enqdetailid', enqdetailid);

    //   return this.httpClient.post<any>(this.restApiUrl + '/api/enquiry/update-giveqty-enquiry-details', body, { observe: 'response' });
    // }

    // updateStatusEnquiryDetails(status, enqdetailid) {

    //   let body: HttpParams = new HttpParams();
    //   body = body.append('status', status);
    //   body = body.append('enqdetailid', enqdetailid);

    //   return this.httpClient.post<any>(this.restApiUrl + '/api/enquiry/update-status-enquiry-details', body, { observe: 'response' });
    // }

    draftEnquiry(prodArr) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/enquiry/draft-enquiry',
            prodArr,
            { observe: 'response' }
        );
    }

    moveToSale(prodArr) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/enquiry/move-to-sale',
            prodArr,
            { observe: 'response' }
        );
    }

    getCustomerData(enqid: string) {
        return this.httpClient.get(
            this.restApiUrl + '/v1/api/enquiry/get-customer-data/' + enqid
        );
    }

    updateCustomerDetailsinEnquiry(id: string, enqid: string) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/enquiry/update-customer/${id}/${enqid}`
        );
    }

    getEnquiredProductData(customer_id, enqid, invdt) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/enquiry/get-enquired-product-data/${customer_id}/${enqid}/${invdt}`
        );
    }

    getBackOder() {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/enquiry/back-order`
        );
    }

    captureError(errorObj) {
        return this.httpClient.post(
            `${this.errorApiUrl}/v1/api/errors/capture-error`,
            errorObj
        );
    }

    // const blob = new Blob([this.lastassessmentdata], {type: 'application/pdf'});

    // FileSaver.saveAs(blob, this.assessmentdata.custuser.firstName + '_export_' + new Date().getTime() + '.pdf');

    print() {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');

        return this.httpClient.get(`${this.restApiUrl}/v1/api/sample-pdf`, {
            headers,
            responseType: 'blob' as 'json',
        });
    }

    printInvoice(submitForm: any) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');

        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/print/invoice-pdf`,
            submitForm,
            { headers, responseType: 'blob' as 'json' }
        );
    }

    printEstimate(submitForm) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');

        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/print/estimate-pdf`,
            submitForm,
            { headers, responseType: 'blob' as 'json' }
        );
    }

    printCreditNote(submitForm) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');

        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/print/credit-note-pdf`,
            submitForm,
            { headers, responseType: 'blob' as 'json' }
        );
    }

    addProduct(product: IProduct) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/admin/add-product',
            product,
            { observe: 'response' }
        );
    }

    updateProduct(submitForm: any) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/admin/update-product',
            submitForm,
            { observe: 'response' }
        );
    }

    //vendor
    getVendorDetails(vendor_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/get-vendor-details/${vendor_id}`
        );
    }

    updateVendor(vendor: Partial<Vendor>): Observable<any> {
        return this.httpClient.post<any>(
            `${this.restApiUrl}/v1/api/admin/update-vendor`,
            vendor
        );
    }

    addVendor(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/admin/add-vendor',
            submitForm,
            { observe: 'response' }
        );
    }
    //brands
    updateBrand(brand: Partial<Brand>): Observable<any> {
        return this.httpClient.post<any>(
            `${this.restApiUrl}/v1/api/admin/update-brand`,
            brand
        );
    }

    addBrand(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/admin/add-brand',
            submitForm,
            { observe: 'response' }
        );
    }

    // customers
    getCustomerDetails(customer_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/get-customer-details/${customer_id}`
        );
    }

    updateCustomer(id: number, changes: Partial<Vendor>): Observable<any> {
        return this.httpClient.put<any>(
            `${this.restApiUrl}/v1/api/admin/update-customer/${id}`,
            changes
        );
    }

    updateCustomerShippingAddress(
        id: number,
        changes: Partial<Vendor>
    ): Observable<any> {
        return this.httpClient.put<any>(
            `${this.restApiUrl}/v1/api/admin/update-customer-shipping-address/${id}`,
            changes
        );
    }

    inactivateCSA(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/admin/inactivate-csa',
            submitForm,
            { observe: 'response' }
        );
    }

    insertCustomerShippingAddress(objectForm): Observable<any> {
        return this.httpClient.post<any>(
            `${this.restApiUrl}/v1/api/admin/insert-customer-shipping-address`,
            objectForm,
            { observe: 'response' }
        );
    }

    // update default
    updateDefaultCustomerDiscount(objectForm) {
        return this.httpClient.put<any>(
            `${this.restApiUrl}/v1/api/admin/update-default-customer-discount`,
            objectForm,
            { observe: 'response' }
        );
    }

    addDiscountsByBrand(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/admin/add-discounts-brand',
            submitForm,
            { observe: 'response' }
        );
    }

    addCustomer(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/admin/add-customer',
            submitForm,
            { observe: 'response' }
        );
    }

    // centers
    getCenterDetails() {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/get-center-details`
        );
    }

    updateCenter(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/admin/update-center',
            submitForm,
            { observe: 'response' }
        );
    }

    convertToSale(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/sale/convert-sale',
            submitForm,
            { observe: 'response' }
        );
    }

    updateTax(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/update-taxrate',
            submitForm,
            { observe: 'response' }
        );
    }

    searchPurchases(submitForm): Observable<Purchase[]> {
        return this.httpClient
            .post<any>(
                `${this.restApiUrl}/v1/api/stock/search-purchase`,
                submitForm
            )
            .pipe(shareReplay());
    }

    searchSales(submitForm): Observable<any> {
        return this.httpClient
            .post<any>(
                `${this.restApiUrl}/v1/api/stock/search-sales`,
                submitForm
            )
            .pipe(shareReplay());
    }

    searchSaleReturn(submitForm): Observable<any> {
        return this.httpClient
            .post<any>(
                `${this.restApiUrl}/v1/api/returns/search-sale-return`,
                submitForm
            )
            .pipe(shareReplay());
    }

    updateSaleReturnReceived(submitForm) {
        return this.httpClient.post<any>(
            `${this.restApiUrl}/v1/api/returns/update-sale-returns-received`,
            submitForm
        );
    }

    showReceiveButton(sale_return_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/returns/show-receive-button/${sale_return_id}`
        );
    }

    // Using share replay prevents, multiple backend calls because of observables | async
    searchEnquiries(submitForm): Observable<Enquiry[]> {
        return this.httpClient
            .post<Enquiry[]>(
                `${this.restApiUrl}/v1/api/enquiry/search-enquiries`,
                submitForm
            )
            .pipe(shareReplay());
    }

    searchAllDraftPurchases(): Observable<Purchase[]> {
        return this.httpClient
            .get<Purchase[]>(
                `${this.restApiUrl}/v1/api/stock/search-all-draft-purchase`
            )
            .pipe(shareReplay());
    }

    // Purchase Screen API's

    savePurchaseOrder(purchaseObj) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/purchase/insert-purchase-details/',
            purchaseObj,
            { observe: 'response' }
        );
    }

    purchaseDetails(id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/stock/purchase-details/${id}`
        );
    }

    purchaseMasterData(id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/stock/purchase-master/${id}`
        );
    }

    deletePurchaseData(id) {
        return this.httpClient.delete(
            `${this.restApiUrl}/v1/api/stock/delete-purchase/${id}`
        );
    }

    deletePurchaseDetails(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/stock/delete-purchase-details',
            submitForm,
            { observe: 'response' }
        );
    }

    deleteEnquiryDetails(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/enquiry/delete-enquiry-details',
            submitForm,
            { observe: 'response' }
        );
    }

    deleteSalesDetails(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/sale/delete-sales-details',
            submitForm,
            { observe: 'response' }
        );
    }

    // Sale Screen API's

    saveSaleOrder(saleObj) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/sale/insert-sale-details/',
            saleObj
        );
    }

    salesMasterData(id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/stock/sales-master/${id}`
        );
    }

    saleDetails(id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/stock/sale-details/${id}`
        );
    }

    deleteSaleMaster(id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/sale/delete-sale-master/${id}`
        );
    }

    deleteItemHistory(sale_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/stock/delete-item-history/${sale_id}`
        );
    }

    deleteSaleDetails(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/stock/delete-sale-details',
            submitForm,
            { observe: 'response' }
        );
    }

    deleteSaleData(id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/sale/delete-sale/${id}`
        );
    }

    deletePurchaseMaster(id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/stock/delete-purchase-master/${id}`
        );
    }

    // end
    isProdExists(pCode) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/prod-exists/${pCode}`
        );
    }

    isCustomerExists(cname) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/customer-exists/${cname}`
        );
    }

    deleteBrand(id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/brand-delete/${id}`
        );
    }

    deleteVendor(id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/vendor-delete/${id}`
        );
    }

    deleteEnquiry(id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/enquiry-delete/${id}`
        );
    }

    // end
    isBrandExists(name) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/brand-exists/${name}`
        );
    }

    isVendorExists(name) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/vendor-exists/${name}`
        );
    }

    addPymtReceived(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/accounts/add-payment-received',
            submitForm,
            { observe: 'response' }
        );
    }

    addVendorPaymentReceived(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl +
                '/v1/api/purchaseaccounts/add-vendor-payment-received',
            submitForm,
            { observe: 'response' }
        );
    }

    addBulkPaymentReceived(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/accounts/add-bulk-payment-received',
            submitForm,
            { observe: 'response' }
        );
    }

    addBulkVendorPaymentReceived(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl +
                '/v1/api/purchaseaccounts/add-bulk-vendor-payment-received',
            submitForm,
            { observe: 'response' }
        );
    }

    getAccountsReceivable() {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/accounts/get-accounts-receivable`
        );
    }

    getAllCustomerDefaultDiscounts(customer_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/all-customer-default-discounts/${customer_id}`
        );
    }

    getDiscountsByCustomer(customer_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/discounts-customer/${customer_id}`
        );
    }

    getDiscountsByCustomerByBrand(customer_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/discounts-customer-brands/${customer_id}`
        );
    }

    getBrandsMissingDiscounts(status, customer_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/brands-missing-discounts/${status}/${customer_id}`
        );
    }

    getShippingAddressByCustomer(customer_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/get-shipping-address/${customer_id}`
        );
    }

    // REPORTS SECTION
    fetchFullProductInventoryReports(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/reports/full-inventory-report',
            submitForm,
            { observe: 'response' }
        );
    }

    fetchProductInventoryReports(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/reports/inventory-report',
            submitForm,
            { observe: 'response' }
        );
    }

    fetchProductSummaryReports(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/reports/product-summary-report',
            submitForm,
            { observe: 'response' }
        );
    }

    fetchItemWiseSaleReports(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/reports/item-wise-sale',
            submitForm,
            { observe: 'response' }
        );
    }

    // /get-ledger-customer/:center_id/:customerid

    getLedgerCustomer(customer_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/accounts/get-ledger-customer/${customer_id}`
        );
    }

    getLedgerVendor(vendor_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/purchaseaccounts/get-ledger-vendor/${vendor_id}`
        );
    }

    getSaleInvoiceByCustomer(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/accounts/get-sale-invoice-customer`,
            submitForm,
            { observe: 'response' }
        );
    }

    getPurhaseInvoiceByVendor(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/purchaseaccounts/get-purchase-invoice-vendor`,
            submitForm,
            { observe: 'response' }
        );
    }

    getSaleMasterData(sale_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/sale/get-sale-master/${sale_id}`
        );
    }

    getCustomerStatement(statementForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/reports/customer-statement`,
            statementForm,
            { observe: 'response' }
        );
    }

    getVendorStatement(statementForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/reports/vendor-statement`,
            statementForm,
            { observe: 'response' }
        );
    }

    getSaleDetailsData(sale_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/sale/get-sale-details/${sale_id}`
        );
    }

    getSaleReturnDetailsData(sale_return_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/returns/get-sale-return-details/${sale_return_id}`
        );
    }

    addSaleReturn(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + `/v1/api/returns/add-sale-return`,
            submitForm,
            { observe: 'response' }
        );
    }

    getPaymentsByCustomer(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/accounts/get-payments-customer`,
            submitForm,
            { observe: 'response' }
        );
    }

    getPaymentsOverviewByCustomer(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/accounts/get-payments-overview-customer`,
            submitForm,
            { observe: 'response' }
        );
    }

    getPaymentsByVendor(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/purchaseaccounts/get-payments-vendor`,
            submitForm,
            { observe: 'response' }
        );
    }

    getPymtTransactionByCustomer(customer_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/accounts/get-pymt-transactions-customer/${customer_id}`
        );
    }

    getPymtTransactionByVendor(vendor_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/purchaseaccounts/get-pymt-transactions-vendor/${vendor_id}`
        );
    }

    getPaymentsByCenter(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/accounts/get-payments-center`,
            submitForm,
            { observe: 'response' }
        );
    }

    getPaymentsOverviewByCenter(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/accounts/get-payments-overview-center`,
            submitForm,
            { observe: 'response' }
        );
    }

    getVendorPaymentsByCenter(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/purchaseaccounts/get-vendor-payments-center`,
            submitForm,
            { observe: 'response' }
        );
    }

    getPymtTransactionsByCenter() {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/accounts/get-pymt-transactions-center`
        );
    }

    getSaleInvoiceByCenter(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/accounts/get-sale-invoice-center`,
            submitForm,
            { observe: 'response' }
        );
    }

    getPurchaseInvoiceByCenter(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/purchaseaccounts/get-purchase-invoice-center`,
            submitForm,
            { observe: 'response' }
        );
    }

    // DashboardPage

    fetchInquirySummary(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/dashboard/inquiry-summary',
            submitForm,
            { observe: 'response' }
        );
    }

    fetchSalesSummary(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/dashboard/sales-summary',
            submitForm,
            { observe: 'response' }
        );
    }

    fetchPurchaseSummary(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/dashboard/purchase-summary',
            submitForm,
            { observe: 'response' }
        );
    }

    fetchSalesTotal(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/dashboard/sales-total',
            submitForm,
            { observe: 'response' }
        );
    }

    fetchCenterSummary(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/dashboard/center-summary',
            submitForm,
            { observe: 'response' }
        );
    }

    fetchCenterReceivablesSummary(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/dashboard/center-receivables-summary',
            submitForm,
            { observe: 'response' }
        );
    }

    fetchPaymentsByCustomer(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/dashboard/payments-customers',
            submitForm,
            { observe: 'response' }
        );
    }

    fetchPermissions(roleid) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/auth/fetch-permissions/${roleid}`
        );
    }

    getUsers(status) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/get-users/${status}`
        );
    }

    getOutstandingBalance(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/admin/get-outstanding-balance`,
            submitForm,
            { observe: 'response' }
        );
    }

    getTopClients(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/dashboard/get-top-clients`,
            submitForm,
            { observe: 'response' }
        );
    }

    addUser(submitForm) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/v1/api/admin/add-user',
            submitForm,
            { observe: 'response' }
        );
    }

    isUsernameExists(phone) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/admin/usename-exists/${phone}`
        );
    }

    updateUserStatus(form) {
        return this.httpClient.post<any>(
            this.restApiUrl + '/api/admin/update-user-status',
            form,
            { observe: 'response' }
        );
    }

    uploadCompanyLogo(submitForm: any, center_id: string, position: string) {
        console.log('123');
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/upload/add/${center_id}/${position}`,
            submitForm
        );
    }

    // zoom testing
    createMeeting() {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/create-meeting`,
            {},
            { observe: 'response' }
        );
    }

    getBanks() {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/accounts/banks-list`
        );
    }

    insertBank(form) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/admin/add-bank`,
            form,
            { observe: 'response' }
        );
    }

    updateBank(form) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/admin/update-bank`,
            form,
            { observe: 'response' }
        );
    }

    getPaymentBankRef(form) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/accounts/pymt-bank-ref-exist`,
            form,
            { observe: 'response' }
        );
    }

    getVendorPaymentBankRef(form) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/accounts/vendor-pymt-bank-ref-exist`,
            form,
            { observe: 'response' }
        );
    }

    getCustomerClosingBalanceStatement(statementForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/reports/customer-closing-balance-statement`,
            statementForm,
            { observe: 'response' }
        );
    }

    getCustomerOpeningBalanceStatement(statementForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/reports/customer-opening-balance-statement`,
            statementForm,
            { observe: 'response' }
        );
    }

    getProductStockWithAllMRP(product_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/stock/all-products-with-mrp/${product_id}`
        );
    }

    deleteProductFromStock(product_id, mrp, is_active) {
        return this.httpClient.delete(
            `${this.restApiUrl}/v1/api/stock/delete-product-from-stock/${product_id}/${mrp}/${is_active}`
        );
    }

    stockCorrection(stock: IStock) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/stock/stock-correction`,
            stock,
            { observe: 'response' }
        );
    }

    getPrintCounterAfterUpdate(sale_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/sale/update-get-print-counter/${sale_id}`
        );
    }

    getPrintCounter(sale_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/sale/get-print-counter/${sale_id}`
        );
    }

    getDuplicateInvoiceNoCheked(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/sale/duplicate-invoiceno-check`,
            submitForm,
            { observe: 'response' }
        );
    }

    getPaymentsReceived(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/receivables/get-payments-received`,
            submitForm,
            { observe: 'response' }
        );
    }

    getPaymentsReceivedDetails(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/receivables/get-payments-received-details`,
            submitForm,
            { observe: 'response' }
        );
    }

    getEditPaymentsReceivedData(payment_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/receivables/get-edit-payments-receivables-data/${payment_id}`
        );
    }

    getCustomerUnpaidInvoices(customer_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/receivables/get-pending-invoices/${customer_id}`
        );
    }

    getPendingReceivablesByCenter(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/receivables/get-pending-receivables`,
            submitForm,
            { observe: 'response' }
        );
    }

    getExcessPaidPayments(customer_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/receivables/get-excess-paid-payments/${customer_id}`
        );
    }

    // customer balances reports
    getCustomerBalanceReports(submitForm) {
        return this.httpClient.post(
            `${this.restApiUrl}/v1/api/reports/get-customer-balance-reports`,
            submitForm,
            { observe: 'response' }
        );
    }

    deletePayment(payment_id) {
        return this.httpClient.get(
            `${this.restApiUrl}/v1/api/receivables/delete-payment/${payment_id}`
        );
    }
}
