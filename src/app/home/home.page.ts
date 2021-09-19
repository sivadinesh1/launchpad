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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  userdata: any;
  center_id: any;

  onSideNavChange: boolean;

  isMenuOpen: boolean;
  contentMargin: number;

  isloaded: boolean;

  constructor(
    private _authservice: AuthenticationService,
    private _sidenavService: SidenavService,
    private _cdr: ChangeDetectorRef,
    private _router: Router
  ) {
    this.isMenuOpen = false;
    this.contentMargin = 180;
    this.isloaded = false;

    this.onToolbarMenuToggle();
    this._sidenavService.sideNavState$.subscribe((res) => {
      this.onSideNavChange = res;
    });
  }

  ngOnInit() {}

  onToolbarMenuToggle() {
    console.log('On toolbar toggled', this.isMenuOpen);
    this.isMenuOpen = !this.isMenuOpen;

    if (!this.isMenuOpen) {
      this.contentMargin = 60;
    } else {
      this.contentMargin = 180;
    }
    this.isloaded = true;
  }

  goAdmin() {
    this._router.navigate([`/home/admin`]);
  }

  async logout() {
    await this._authservice.logOut();
    this._router.navigateByUrl('');
  }

  check() {
    console.log('check');
  }
}
