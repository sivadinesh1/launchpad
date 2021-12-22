import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { User } from 'src/app/models/User';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SettingsDialogComponent } from '../settings/settings-dialog/settings-dialog.component';

interface Page {
    link: string;
    name: string;
    icon: string;
    children?: Page[];
}

@Component({
    selector: 'app-left-menu',
    templateUrl: './left-menu.component.html',
    styleUrls: ['./left-menu.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeftMenuComponent {
    public sideNavState = false;
    public linkText = false;
    clickedItem: any;

    clickedMenu_data$: Observable<any>;
    user_data$: Observable<User>;
    user_data: any;
    panelOpenState = false;
    expanded = false; // Customers Menu
    expanded1 = false; // Vendors Menu

    pages: Page[] = [];
    secondarymenus: Page[] = [];

    admin_pages: Page[] = [
        {
            name: 'Home',
            link: '/home/admin-dashboard',
            icon: '/assets/images/svg/dashboard-black.svg',
        },
        {
            name: 'Enquiry',
            link: '/home/enquiry/open-enquiry/O/weekly',
            icon: '/assets/images/svg/enquiry.svg',
        },
        {
            name: 'Sale Orders',
            link: '/home/search-sales',
            icon: '/assets/images/svg/sales.svg',
        },
        {
            name: 'Customers',
            link: '',
            icon: '/assets/images/svg/customers.svg',
            children: [
                {
                    name: 'List',
                    link: '/home/view-customers',
                    icon: '/assets/images/svg/money.svg',
                },
                {
                    name: 'Receivables',
                    link: '/home/payments',
                    icon: '/assets/images/svg/money.svg',
                },
                {
                    name: 'Statements',
                    link: '/home/customer-accounts-statement',
                    icon: '/assets/images/svg/money.svg',
                },
            ],
        },

        {
            name: 'Sale Returns',
            link: '/home/search-return-sales',
            icon: '/assets/images/svg/return.svg',
        },
        {
            name: 'Stock Issue',
            link: '/home/search-stock-issues',
            icon: '/assets/images/svg/bullet-list.svg',
        },
        {
            name: 'Receivables',
            link: '/home/receivables',
            icon: '/assets/images/svg/sales.svg',
        },
        {
            name: 'Purchase',
            link: '/home/search-purchase-order',
            icon: '/assets/images/svg/purchase.svg',
        },

        {
            name: 'Vendors',
            link: '',
            icon: '/assets/images/svg/vendors.svg',
            children: [
                {
                    name: 'List',
                    link: '/home/view-vendors',
                    icon: '/assets/images/svg/payments.svg',
                },
                {
                    name: 'Payments',
                    link: '/home/vpayments',
                    icon: '/assets/images/svg/payments.svg',
                },
                {
                    name: 'Statements',
                    link: '/home/vpurchase-accounts-statement',
                    icon: '/assets/images/svg/money.svg',
                },
            ],
        },
        {
            name: 'Stocks',
            link: '/home/view-products',
            icon: '/assets/images/svg/product.svg',
        },
        {
            name: 'Brands',
            link: '/home/view-brands',
            icon: '/assets/images/svg/brands.svg',
        },

        {
            name: 'Reports',
            link: '/home/reports-home',
            icon: '/assets/images/svg/growth.svg',
        },

        {
            name: 'Settings',
            link: '/home/admin-dashboard',
            icon: '/assets/images/svg/settings.svg',
        },
    ];

    secondary_menus: Page[] = [
        {
            name: 'Reports 1',
            link: '/home/reports-home',
            icon: '/assets/images/svg/growth.svg',
        },
        {
            name: 'Reports 2',
            link: '/home/reports-home',
            icon: '/assets/images/svg/growth.svg',
        },
    ];

    user_pages: Page[] = [
        {
            name: 'DASHBOARD',
            link: '/home/dashboard',
            icon: '/assets/images/svg/dashboard-black.svg',
        },
        {
            name: 'ENQUIRY',
            link: '/home/enquiry/open-enquiry/O/weekly',
            icon: '/assets/images/svg/enquiry.svg',
        },
        {
            name: 'SALE',
            link: '/home/search-sales',
            icon: '/assets/images/svg/sales.svg',
        },
        {
            name: 'PURCHASE',
            link: '/home/search-purchase',
            icon: '/assets/images/svg/purchase.svg',
        },
        {
            name: 'REPORTS',
            link: '/home/search-return-sales',
            icon: '/assets/images/svg/growth.svg',
        },
    ];

    constructor(
        private _authService: AuthenticationService,
        private _router: Router,
        private _modalcontroller: ModalController,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef
    ) {
        this.clickedMenu_data$ = this._authService.currentMenu;

        this.clickedMenu_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.clickedItem = data;

                this._cdr.markForCheck();
            });

        this.user_data$ = this._authService.currentUser;

        this.user_data$
            .pipe(filter((data) => data !== null))
            .subscribe((data: any) => {
                this.user_data = data;

                if (this.user_data !== undefined) {
                    if (this.user_data?.role === 'ADMIN') {
                        this.pages = this.admin_pages;
                        this.secondarymenus = this.secondary_menus;
                    } else {
                        this.pages = this.user_pages;
                    }
                }
                this._cdr.markForCheck();
            });
        this.expanded = false;
        this.expanded1 = false;
    }

    onSinenavToggle() {
        this.sideNavState = !this.sideNavState;

        setTimeout(() => {
            this.linkText = this.sideNavState;
            this._cdr.detectChanges();
        }, 200);

        this._cdr.detectChanges();
    }

    routeTo(name: string, url: string) {
        this._authService.setCurrentMenu(name);

        this.clickedItem = name;
        if (this.user_data.role === 'ADMIN' && this.clickedItem === 'Home') {
            this._router.navigateByUrl('/home/admin-dashboard');
        } else if (name === 'Settings') {
            this.openSettings();
        } else if (name === 'Vendors' || name === 'Customers') {
            // do nothing just expand / collapse
        } else {
            this._router.navigateByUrl(url);
        }

        this._cdr.markForCheck();
    }

    async openSettings() {
        const modal = await this._modalcontroller.create({
            component: SettingsDialogComponent,
            componentProps: {
                center_id: this.user_data.center_id,
                role_id: this.user_data.role_id,
            },
            cssClass: 'select-modal',
        });

        modal.onDidDismiss().then((result) => {
            console.log('The result:', result);
            this._cdr.markForCheck();
        });

        await modal.present();
    }

    goAdmin() {
        this._router.navigate([`/home/admin`]);
    }

    async logout() {
        await this._authService.logOut();
        this._router.navigateByUrl('');
    }

    viewUsers() {
        this._router.navigate(['home/users-list']);
    }

    showNewSales($event) {
        $event.stopPropagation();
        this._router.navigate([`home/sales/edit/0/TI`]);
    }

    goStockIssue($event) {
        $event.stopPropagation();
        this._router.navigate([`home/sales/edit/0/SI`]);
    }

    goEnquiryScreen($event) {
        $event.stopPropagation();
        this._router.navigateByUrl(`/home/enquiry`);
    }

    editCenter() {
        this._router.navigate([`/home/center/edit`, this.user_data.center_id]);
    }

    goPurchaseAddScreen($event) {
        $event.stopPropagation();
        this._router.navigateByUrl(`/home/purchase-order/edit/0`);
    }

    toggleSubMenu(param) {
        if (param === 'vendor') {
            this.expanded1 = !this.expanded1;
        } else if (param === 'customer') {
            this.expanded = !this.expanded;
        }
    }
}
