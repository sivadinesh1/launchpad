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
import { Sales } from '../models/Sales';
import { Customer } from '../models/Customer';
import { Vendor } from '../models/Vendor';
import { EnquiryDetail } from '../models/EnquiryDetail';
import { Enquiry } from '../models/Enquiry';
import { Brand } from '../models/Brand';
import { DashboardPage } from '../dashboard/dashboard.page';

@Injectable({
  providedIn: 'root',
})
export class CommonApiService {
  restApiUrl = environment.restApiUrl;
  errorApiUrl = errorApiUrl;

  constructor(private httpClient: HttpClient) {}

  getStates() {
    return this.httpClient.get(this.restApiUrl + '/v1/api/admin/get-states');
  }

  getTimezones() {
    return this.httpClient.get(this.restApiUrl + '/v1/api/admin/get-timezones');
  }

  getAllPartsStockData() {
    return this.httpClient.get(this.restApiUrl + '/v1/api/inventory/all');
  }

  viewProductInfo(center_id: string, product_id: string) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/admin/view-product-info/${center_id}/${product_id}`
    );
  }

  viewProductsCount(center_id: string) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/admin/view-products-count/${center_id}`
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
      .pipe(
        map((res: any) => {
          return res.body;
        })
      );
  }

  getProductInformation(submitForm) {
    return this.httpClient.post(
      `${this.restApiUrl}/v1/api/search-product-information`,
      submitForm,
      { observe: 'response' }
    );
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

  getBrandInfo(submitForm) {
    return this.httpClient.post(
      `${this.restApiUrl}/v1/api/search-brand`,
      submitForm,
      { observe: 'response' }
    );
  }

  getOpenEnquiries(centerid: number, status: string) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/enquiry/open-enquiries/${centerid}/${status}`
    );
  }

  getAllActiveVendors(centerid): Observable<Vendor[]> {
    return this.httpClient
      .get<Vendor[]>(
        `${this.restApiUrl}/v1/api/all-active-vendors1/${centerid}`
      )
      .pipe(catchError((err) => of([])));
  }

  getAllActiveBrands(centerid, status): Observable<Brand[]> {
    return this.httpClient.get<Brand[]>(
      `${this.restApiUrl}/v1/api/all-active-brands/${centerid}/${status}`
    );
  }

  getAllActivePymtModes(centerid, status): Observable<any> {
    return this.httpClient.get<Brand[]>(
      `${this.restApiUrl}/v1/api/all-pymt-modes/${centerid}/${status}`
    );
  }

  getAllActiveCustomers(centerid) {
    return this.httpClient.get(
      this.restApiUrl + '/v1/api/all-active-customers/' + centerid
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

  getEnquiredProductData(center_id, customer_id, enqid, invdt) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/enquiry/get-enquired-product-data/${center_id}/${customer_id}/${enqid}/${invdt}`
    );
  }

  getBackOder(center_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/enquiry/back-order/${center_id}`
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
      headers: headers,
      responseType: 'blob' as 'json',
    });
  }

  printInvoice(submitForm) {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    return this.httpClient.post(
      `${this.restApiUrl}/v1/api/print/invoice-pdf`,
      submitForm,
      { headers: headers, responseType: 'blob' as 'json' }
    );
  }

  printEstimate(submitForm) {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    return this.httpClient.post(
      `${this.restApiUrl}/v1/api/print/estimate-pdf`,
      submitForm,
      { headers: headers, responseType: 'blob' as 'json' }
    );
  }

  printCreditNote(submitForm) {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    return this.httpClient.post(
      `${this.restApiUrl}/v1/api/print/credit-note-pdf`,
      submitForm,
      { headers: headers, responseType: 'blob' as 'json' }
    );
  }

  addProduct(submitForm) {
    return this.httpClient.post<any>(
      this.restApiUrl + '/v1/api/admin/add-product',
      submitForm,
      { observe: 'response' }
    );
  }

  updateProduct(submitForm) {
    return this.httpClient.post<any>(
      this.restApiUrl + '/v1/api/admin/update-product',
      submitForm,
      { observe: 'response' }
    );
  }

  //vendor
  getVendorDetails(center_id, vendor_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/admin/get-vendor-details/${center_id}/${vendor_id}`
    );
  }

  updateVendor(id: number, changes: Partial<Vendor>): Observable<any> {
    return this.httpClient.put<any>(
      `${this.restApiUrl}/v1/api/admin/update-vendor/${id}`,
      changes
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
  updateBrand(id: number, changes: Partial<Vendor>): Observable<any> {
    return this.httpClient.put<any>(
      `${this.restApiUrl}/v1/api/admin/update-brand/${id}`,
      changes
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
  getCustomerDetails(center_id, customer_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/admin/get-customer-details/${center_id}/${customer_id}`
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
  getCenterDetails(center_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/admin/get-center-details/${center_id}`
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

  // searchPurchases(centerid, vendorid, status, fromdate, todate): Observable<Purchase[]> {
  //   return this.httpClient.get<Purchase[]>(`${this.restApiUrl}/api/stock/search-purchase/${centerid}/${vendorid}/${status}/${fromdate}/${todate}`)
  //     .pipe(shareReplay());
  // }

  searchPurchases(submitForm): Observable<Purchase[]> {
    return this.httpClient
      .post<Purchase[]>(
        `${this.restApiUrl}/v1/api/stock/search-purchase`,
        submitForm
      )
      .pipe(shareReplay());
  }

  searchSales(submitForm): Observable<Sales[]> {
    return this.httpClient
      .post<Sales[]>(`${this.restApiUrl}/v1/api/stock/search-sales`, submitForm)
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

  showReceiveButton(centerid, sale_return_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/returns/show-receive-button/${centerid}/${sale_return_id}`
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

  searchAllDraftPurchases(centerid): Observable<Purchase[]> {
    return this.httpClient
      .get<Purchase[]>(
        `${this.restApiUrl}/v1/api/stock/search-all-draft-purchase/${centerid}`
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
      saleObj,
      { observe: 'response' }
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

  deleteItemHistory(saleid) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/stock/delete-item-history/${saleid}`
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
  isProdExists(pCode, centerid) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/admin/prod-exists/${pCode}/${centerid}`
    );
  }

  isCustomerExists(cname, centerid) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/customer-exists/${cname}/${centerid}`
    );
  }

  deleteBrand(id) {
    return this.httpClient.get(`${this.restApiUrl}/v1/api/brand-delete/${id}`);
  }

  deleteVendor(id) {
    return this.httpClient.get(`${this.restApiUrl}/v1/api/vendor-delete/${id}`);
  }

  deleteEnquiry(id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/enquiry-delete/${id}`
    );
  }

  // end
  isBrandExists(name, center_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/brand-exists/${name}/${center_id}`
    );
  }

  isVendorExists(name, center_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/vendor-exists/${name}/${center_id}`
    );
  }

  addPymtReceived(submitForm) {
    return this.httpClient.post<any>(
      this.restApiUrl + '/v1/api/accounts/add-payment-received',
      submitForm,
      { observe: 'response' }
    );
  }

  addVendorPymtReceived(submitForm) {
    return this.httpClient.post<any>(
      this.restApiUrl + '/v1/api/purchaseaccounts/add-vendor-payment-received',
      submitForm,
      { observe: 'response' }
    );
  }

  addBulkPymtReceived(submitForm) {
    return this.httpClient.post<any>(
      this.restApiUrl + '/v1/api/accounts/add-bulk-payment-received',
      submitForm,
      { observe: 'response' }
    );
  }

  addBulkVendorPymtReceived(submitForm) {
    return this.httpClient.post<any>(
      this.restApiUrl +
        '/v1/api/purchaseaccounts/add-bulk-vendor-payment-received',
      submitForm,
      { observe: 'response' }
    );
  }

  getAccountsReceivable(centerid) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/accounts/get-accounts-receivable/${centerid}`
    );
  }

  // getCustomerDiscount(center_id, customer_id) {
  //   return this.httpClient.get(`${this.restApiUrl}/api/admin/customer-discount/${center_id}/${customer_id}`);
  // }

  getAllCustomerDefaultDiscounts(center_id, customer_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/admin/all-customer-default-discounts/${center_id}/${customer_id}`
    );
  }

  getDiscountsByCustomer(center_id, customer_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/admin/discounts-customer/${center_id}/${customer_id}`
    );
  }

  getDiscountsByCustomerByBrand(center_id, customer_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/admin/discounts-customer-brands/${center_id}/${customer_id}`
    );
  }

  getBrandsMissingDiscounts(center_id, status, customer_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/brands-missing-discounts/${center_id}/${status}/${customer_id}`
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

  // /get-ledger-customer/:centerid/:customerid

  getLedgerCustomer(center_id, customer_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/accounts/get-ledger-customer/${center_id}/${customer_id}`
    );
  }

  getLedgerVendor(center_id, vendor_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/purchaseaccounts/get-ledger-vendor/${center_id}/${vendor_id}`
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

  getSaleReturnDetailsData(center_id, sale_return_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/returns/get-sale-return-details/${center_id}/${sale_return_id}`
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

  getPymtTransactionByCustomer(center_id, customer_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/accounts/get-pymt-transactions-customer/${center_id}/${customer_id}`
    );
  }

  getPymtTransactionByVendor(center_id, vendor_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/purchaseaccounts/get-pymt-transactions-vendor/${center_id}/${vendor_id}`
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

  getPymtTransactionsByCenter(center_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/accounts/get-pymt-transactions-center/${center_id}`
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

  fetchPermissions(centerid, roleid) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/auth/fetch-permissions/${centerid}/${roleid}`
    );
  }

  getUsers(centerid, status) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/admin/get-users/${centerid}/${status}`
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

  isUsernameExists(phone, center_id) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/admin/usename-exists/${phone}/${center_id}`
    );
  }

  updateUserStatus(form) {
    return this.httpClient.post<any>(
      this.restApiUrl + '/api/admin/update-user-status',
      form,
      { observe: 'response' }
    );
  }

  uploadCompanyLogo(submitForm: any, centerid: string, position: string) {
    console.log('123');
    return this.httpClient.post(
      `${this.restApiUrl}/v1/api/upload/add/${centerid}/${position}`,
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

  getBanks(centerid) {
    return this.httpClient.get(
      `${this.restApiUrl}/v1/api/accounts/banks-list/${centerid}`
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

  deleteProductFromStock(product_id, mrp, center_id) {
    return this.httpClient.delete(
      `${this.restApiUrl}/v1/api/stock/delete-product-from-stock/${product_id}/${mrp}/${center_id}`
    );
  }

  stockCorrection(submitForm) {
    return this.httpClient.post(
      `${this.restApiUrl}/v1/api/stock/stock-correction`,
      submitForm,
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
}
