import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NullToQuotePipe } from './util/pipes/null-quote.pipe';
import { NullToZeroPipe } from './util/pipes/null-zero.pipe';
import { NullToDashPipe } from './util/pipes/null-dash.pipe';
import { NullToNaPipe } from './util/pipes/null-na.pipe';
import { CheckBooleanPipe } from './util/pipes/check-boolean.pipe';
import { SupDatePipe } from './util/pipes/sup-date.pipe';
import { CustomPipe } from './util/pipes/keys.pipe';
import { NoNullPipe } from './util/pipes/nonull.pipe';
import { TruncatePipe } from './util/pipes/truncate.pipe';
import { UrlidPipe } from './util/pipes/url-id.pipe';
import { SafePipe } from './util/pipes/safe-html.pipe';
import { EscapeHtmlPipe } from './util/pipes/keep-html.pipe';
import { DayWeekPipe } from './util/pipes/day-week.pipe';
import { ZeroToValPipe } from './util/pipes/zerotoval.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import {
    MatStepperModule,
    MatStep,
    MatHorizontalStepper,
} from '@angular/material/stepper';

import { AddProductComponent } from './components/add-product/add-product.component';
import { CurrencyPadComponent } from './components/currency-pad/currency-pad.component';
import { PreventCutCopyPasteDirective } from './directive/prevent-cut-copy-paste.directive';
import { ShowVendorsComponent } from './components/show-vendors/show-vendors.component';

import { AutoFocusDirective } from './util/directives/auto-focus.directive';
import { FocusedDirective } from './util/directives/focused-directive';
import { ShowHidePasswordComponent } from './components/show-hide-password/show-hide-password.component';

import { WindowComponent } from './components/window.component';

import { ChangeTaxComponent } from './components/change-tax/change-tax.component';
import { ChangeMrpComponent } from './components/change-mrp/change-mrp.component';
import { PreventDoubleClickDirective } from './util/directives/prevent-double-click.directive';
import { VendorEditDialogComponent } from './components/vendors/vendor-edit-dialog/vendor-edit-dialog.component';
import { VendorAddDialogComponent } from './components/vendors/vendor-add-dialog/vendor-add-dialog.component';

import { CustomerEditDialogComponent } from './components/customers/customer-edit-dialog/customer-edit-dialog.component';
import { CustomerAddDialogComponent } from './components/customers/customer-add-dialog/customer-add-dialog.component';
import { CustomerViewDialogComponent } from './components/customers/customer-view-dialog/customer-view-dialog.component';

import { LoadingComponent } from './components/loading/loading.component';
import { MessagesComponent } from './components/messages/messages.component';
import { InvoiceSuccessComponent } from './components/invoice-success/invoice-success.component';

import { HeaderComponent } from './components/header/header.component';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { ArrowDivDirective } from './directive/arrow-div.directive';
import { RouterModule } from '@angular/router';
import { AddMoreEnquiryComponent } from './components/add-more-enquiry/add-more-enquiry.component';
import { ProductEditDialogComponent } from './components/products/product-edit-dialog/product-edit-dialog.component';
import { ProductAddDialogComponent } from './components/products/product-add-dialog/product-add-dialog.component';
import { BrandAddDialogComponent } from './components/brands/brand-add-dialog/brand-add-dialog.component';
import { BrandEditDialogComponent } from './components/brands/brand-edit-dialog/brand-edit-dialog.component';
import { DefaultDiscountsComponent } from './components/customers/discount/default-discounts/default-discounts.component';
import { BrandDiscountsComponent } from './components/customers/discount/brand-discounts/brand-discounts.component';
import { CustomerEditShippingAddressComponent } from './components/customers/customer-edit-shipping-address/customer-edit-shipping-address.component';
import { VendorViewDialogComponent } from './components/vendors/vendor-view-dialog/vendor-view-dialog.component';
import { ConvertToSaleDialogComponent } from './components/convert-to-sale-dialog/convert-to-sale-dialog.component';
import { CustomerPaymentDialogComponent } from './components/customers/customer-payment-dialog/customer-payment-dialog.component';
import { AccountsReceivablesComponent } from './components/accounts/accounts-receivables/accounts-receivables.component';
import { SuccessMessageDialogComponent } from './components/success-message-dialog/success-message-dialog.component';
import { DeleteBrandDialogComponent } from './components/delete-brand-dialog/delete-brand-dialog.component';
import { DeleteVendorDialogComponent } from './components/delete-vendor-dialog/delete-vendor-dialog.component';
import { DeleteEnquiryDialogComponent } from './components/delete-enquiry-dialog/delete-enquiry-dialog.component';
import { SalesInvoiceDialogComponent } from './components/sales/sales-invoice-dialog/sales-invoice-dialog.component';
import { PurchaseEntryDialogComponent } from './components/purchase/purchase-entry-dialog/purchase-entry-dialog.component';
import { FilterPipe } from './util/pipes/filter.pipe';
import { EnquiryViewDialogComponent } from './components/enquiry/enquiry-view-dialog/enquiry-view-dialog.component';
import { WhatsappDialogComponent } from './components/social/whatsapp/whatsapp-dialog/whatsapp-dialog.component';
import { NgxSpinnerModule } from 'ngx-spinner';

import { NumericDirective } from './util/directives/numeric.directive';
import { DisableControlDirective } from './util/directives/disable-control.directive';
import { SalesReturnDialogComponent } from './components/sales/sales-return-dialog/sales-return-dialog.component';
import { SaleReturnViewComponent } from './components/returns/sale-return-view/sale-return-view.component';
import { SaleReturnReceiveComponent } from './components/returns/sale-return-receive/sale-return-receive.component';
import { SearchDialogComponent } from './components/search/search-dialog/search-dialog.component';
import { SettingsDialogComponent } from './components/settings/settings-dialog/settings-dialog.component';
import { InventoryReportsDialogComponent } from './components/reports/inventory-reports-dialog/inventory-reports-dialog.component';
import { AddUserComponent } from './components/users/add-user/add-user.component';
import { EnquiryPrintComponent } from './components/enquiry-print/enquiry-print.component';
import { ShowStatementComponent } from './components/reports/show-statement/show-statement.component';
import { VendorPaymentDialogComponent } from './components/vendors/vendor-payment-dialog/vendor-payment-dialog.component';
import { AccountsPayableComponent } from './components/accounts/accounts-payable/accounts-payable.component';
import { ShowVendorStatementComponent } from './components/reports/show-vendor-statement/show-vendor-statement.component';
import { SelectOnFocusDirective } from './util/directives/select-focus.directive';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PricePipePipe } from './util/pipes/price-formatter.pipe';
import { ProductCorrectionDialogComponent } from './components/products/product-correction-dialog/product-correction-dialog.component';
import { ManualInvoiceNumberDialogComponent } from './components/sales/manual-invoice-number-dialog/manual-invoice-number-dialog.component';
import { SearchInvoiceNoComponent } from './components/search-invoice-no/search-invoice-no.component';
import { SearchCustomersComponent } from './components/search-customers/search-customers.component';
import { AscendingComponent } from './components/util/ascending/ascending.component';
import { DescendingComponent } from './components/util/descending/descending.component';
import { PrintReceivablesComponent } from './components/receivables/print-receivables/print-receivables.component';
import { ApplyNowComponent } from './components/receivables/apply-now/apply-now.component';
import { DeletePaymentDialogComponent } from './components/delete-payments-dialog/delete-payments-dialog.component';

const components = [
    NullToQuotePipe,
    NullToZeroPipe,
    NullToDashPipe,
    NullToNaPipe,
    CheckBooleanPipe,
    SupDatePipe,
    CustomPipe,
    NoNullPipe,
    TruncatePipe,
    UrlidPipe,
    SafePipe,
    EscapeHtmlPipe,
    DayWeekPipe,
    ZeroToValPipe,
    PricePipePipe,
    FilterPipe,

    AddProductComponent,
    SearchDialogComponent,
    SettingsDialogComponent,
    InventoryReportsDialogComponent,
    ManualInvoiceNumberDialogComponent,

    VendorEditDialogComponent,
    VendorAddDialogComponent,

    CustomerAddDialogComponent,
    CustomerEditDialogComponent,
    PrintReceivablesComponent,
    ApplyNowComponent,
    CustomerPaymentDialogComponent,
    VendorPaymentDialogComponent,
    SalesInvoiceDialogComponent,
    SalesReturnDialogComponent,
    SaleReturnViewComponent,
    SaleReturnReceiveComponent,
    PurchaseEntryDialogComponent,
    EnquiryViewDialogComponent,

    WhatsappDialogComponent,

    DeleteBrandDialogComponent,
    DeleteVendorDialogComponent,
    DeletePaymentDialogComponent,

    DeleteEnquiryDialogComponent,

    AccountsReceivablesComponent,
    AccountsPayableComponent,

    ProductAddDialogComponent,
    ProductEditDialogComponent,
    ProductCorrectionDialogComponent,

    BrandAddDialogComponent,
    BrandEditDialogComponent,

    AddUserComponent,

    DefaultDiscountsComponent,
    BrandDiscountsComponent,

    VendorViewDialogComponent,

    CustomerViewDialogComponent,
    CustomerEditShippingAddressComponent,

    SuccessMessageDialogComponent,

    CurrencyPadComponent,
    InvoiceSuccessComponent,
    SearchInvoiceNoComponent,
    EnquiryPrintComponent,
    AddMoreEnquiryComponent,
    ShowVendorsComponent,

    ChangeTaxComponent,
    ChangeMrpComponent,

    ConvertToSaleDialogComponent,

    AutoFocusDirective,
    FocusedDirective,
    PreventDoubleClickDirective,
    SelectOnFocusDirective,
    NumericDirective,
    DisableControlDirective,

    ShowHidePasswordComponent,

    HeaderComponent,
    SearchCustomersComponent,
    AscendingComponent,
    DescendingComponent,
    LeftMenuComponent,

    WindowComponent,
    LoadingComponent,
    MessagesComponent,
    ShowStatementComponent,
    ShowVendorStatementComponent,
];

const matcomponents = [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSliderModule,
    MatSelectModule,
    MatRadioModule,

    MatSlideToggleModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatCardModule,
    MatNativeDateModule,

    MatToolbarModule,
    MatTooltipModule,
    MatTableModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatButtonModule,

    MatSidenavModule,
    MatListModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatTabsModule,
    MatStepperModule,
    ScrollingModule,
];

@NgModule({
    declarations: [
        ...components,
        PreventCutCopyPasteDirective,

        ArrowDivDirective,
        SearchCustomersComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        IonicModule,
        RouterModule,
        ...matcomponents,
        NgxSpinnerModule,
    ],
    exports: [...matcomponents, ...components, IonicModule, NgxSpinnerModule],
    entryComponents: [
        AddProductComponent,
        CurrencyPadComponent,
        ShowVendorsComponent,
        ChangeTaxComponent,
        ChangeMrpComponent,
        VendorAddDialogComponent,
        VendorViewDialogComponent,
        BrandAddDialogComponent,
        BrandEditDialogComponent,
        ConvertToSaleDialogComponent,
        AddUserComponent,
        DefaultDiscountsComponent,
        BrandDiscountsComponent,
        DeleteEnquiryDialogComponent,
        CustomerAddDialogComponent,
        CustomerEditDialogComponent,
        PrintReceivablesComponent,
        CustomerAddDialogComponent,
        AccountsReceivablesComponent,
        AccountsPayableComponent,
        SuccessMessageDialogComponent,
        DeleteBrandDialogComponent,
        DeleteVendorDialogComponent,
        DeletePaymentDialogComponent,
        CustomerViewDialogComponent,
        CustomerEditShippingAddressComponent,
        InvoiceSuccessComponent,
        SearchInvoiceNoComponent,
        EnquiryPrintComponent,
        AddMoreEnquiryComponent,
        SalesInvoiceDialogComponent,
        PurchaseEntryDialogComponent,
        EnquiryViewDialogComponent,
        WhatsappDialogComponent,
        SalesReturnDialogComponent,
        SaleReturnViewComponent,
        SaleReturnReceiveComponent,
        SearchDialogComponent,
        SettingsDialogComponent,
        InventoryReportsDialogComponent,
        ShowStatementComponent,
        ShowVendorStatementComponent,

        ApplyNowComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {}
