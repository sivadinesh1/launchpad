import {
	Component,
	ViewChild,
	OnInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
} from '@angular/core';
import { LoadingService } from '../components/loading/loading.service';
import { MessagesService } from '../components/messages/messages.service';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { SidenavService } from '../services/sidenav.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss'],
	providers: [LoadingService, MessagesService],
})
export class HomePage implements OnInit {
	userdata: any;
	center_id: any;

	onSideNavChange: boolean;

	constructor(
		private _authservice: AuthenticationService,
		private _sidenavService: SidenavService,
		private _router: Router
	) {
		this._sidenavService.sideNavState$.subscribe((res) => {
			this.onSideNavChange = res;
		});
	}

	ngOnInit() {}

	goAdmin() {
		this._router.navigate([`/home/admin`]);
	}

	async logout() {
		await this._authservice.logOut();
		this._router.navigateByUrl('');
	}
}
