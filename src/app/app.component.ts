import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
} from '@angular/core';

import { Platform } from '@ionic/angular';

import { LoadingService } from './services/loading.service';
import { VersionCheckService } from './services/version-check.service';
import { RouterOutlet } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  @ViewChild(RouterOutlet, { static: true }) outlet: RouterOutlet;

  isConnected;
  any;

  constructor(
    private platform: Platform,
    private _loadingservice: LoadingService,

    private _versionCheckService: VersionCheckService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {});
  }

  ngOnInit(): void {
    this._versionCheckService.initVersionCheck(environment.versionCheckURL);
  }
}
