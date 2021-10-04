import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../components/loading/loading.service';
import { MessagesService } from '../components/messages/messages.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    providers: [LoadingService, MessagesService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
    center_id: any;

    onSideNavChange: boolean;

    isMenuOpen: boolean;
    contentMargin: number;

    isLoaded: boolean;

    constructor(
        private _authService: AuthenticationService,

        private _router: Router
    ) {
        this.isMenuOpen = false;
        this.contentMargin = 180;
        this.isLoaded = false;

        this.onToolbarMenuToggle();
    }

    ngOnInit() {}

    onToolbarMenuToggle() {
        this.isMenuOpen = !this.isMenuOpen;

        if (!this.isMenuOpen) {
            this.contentMargin = 60;
        } else {
            this.contentMargin = 180;
        }
        this.isLoaded = true;
    }

    goAdmin() {
        this._router.navigate([`/home/admin`]);
    }

    async logout() {
        await this._authService.logOut();
        this._router.navigateByUrl('');
    }

    check() {
        console.log('check');
    }
}
