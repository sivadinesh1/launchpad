import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, filter } from 'rxjs/operators';

import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Platform } from '@ionic/angular';

import { Storage } from '@ionic/storage';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { User } from '../models/User';
import { CommonApiService } from 'src/app/services/common-api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private currentUserSubject = new BehaviorSubject<User>(null);
  public currentUser: Observable<User> = this.currentUserSubject.asObservable();

  private currentMenuSubject = new BehaviorSubject<any>(null);
  public currentMenu: Observable<any> = this.currentMenuSubject.asObservable();

  private currentPermisssionSubject = new BehaviorSubject<any>(null);
  public currentPermisssion: Observable<any> =
    this.currentPermisssionSubject.asObservable();

  restApiUrl = environment.restApiUrl;

  storagemode: any;
  device: any;
  errormsg = 'Something went wrong. Contact administrator.';

  token: any;

  constructor(
    private httpClient: HttpClient,
    private plt: Platform,
    private storage: Storage,
    private _commonApiService: CommonApiService,
    private _router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.plt.ready().then(async () => {
      if (isPlatformBrowser(this.platformId)) {
        await this.storage.create();
        this.storagemode = this.storage;
        this.device = 'browser';
      } else {
        this.device = 'mobile';
      }

      this.reloadLocalStorage();
    });
  }

  async reloadLocalStorage() {
    let tempCurrentUser = await this.getLocalStoreItems('currentUser');
    let tempMenuUser = await this.getLocalStoreItems('currentMenu');
    let tempCurrentPermission = await this.getLocalStoreItems(
      'currentPermission'
    );

    if (tempCurrentUser) {
      this.currentUserSubject.next(JSON.parse(tempCurrentUser));
    }
    if (tempMenuUser) {
      this.currentMenuSubject.next(tempMenuUser);
    }

    if (tempCurrentPermission) {
      this.currentPermisssionSubject.next(tempCurrentPermission);
    }
  }

  async setLocalStoreItems(key, value) {
    await this.storagemode.set(key, value);
  }

  async getLocalStoreItems(key): Promise<string> {
    return await this.storagemode.get(key);
  }

  register(username, password) {
    return this.httpClient
      .post<any>(`${this.restApiUrl}/v1/api/register`, { username, password })
      .pipe(
        map(async (userData: any) => {
          await this.storagemode.clear();

          let tokenStr = 'Bearer ' + userData.additionalinfo;

          await this.storagemode.set('username', username);
          await this.storagemode.set('token', tokenStr);
          await this.storagemode.set(
            'currentUser',
            JSON.stringify(userData.obj)
          );

          this.currentUserSubject.next(userData.obj);

          return userData;
        })
      );
  }

  async logOut() {
    await this.storagemode.clear();
    this.currentUserSubject.next(null);
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  superadmin(center_id: string) {
    return this.httpClient
      .post<any>(`${this.restApiUrl}/v1/api/auth/super-admin`, { center_id })
      .pipe(
        map(async (data: any) => {
          if (data.result === 'success') {
            await this.storagemode.clear();

            await this.storagemode.set('currentUser', JSON.stringify(data));

            this.currentUserSubject.next(data);
          }
          return data;
        })
      );
  }

  // login(username: string, password: string) {
  //   return this.httpClient
  //     .post<any>(`${this.restApiUrl}/v1/api/auth/login`, { username, password })
  //     .pipe(
  //       map(async (data: any) => {
  //         if (data.result === 'success') {
  //           await this.storagemode.clear();

  //           await this.storagemode.set('currentUser', JSON.stringify(data.obj));

  //           this.currentUserSubject.next(data.obj);
  //         }
  //         return data;
  //       })
  //     );
  // }

  // getAllActiveVendors(centerid): Observable<Vendor[]> {
  //   return this.httpClient
  //     .get<Vendor[]>(
  //       `${this.restApiUrl}/v1/api/all-active-vendors1/${centerid}`
  //     )
  //     .pipe(catchError((err) => of([])));
  // }

  // const floApi = axios.create({ baseURL: `${hostname}`, withCredentials: true });

  login(username: string, password: string) {
    return this.httpClient
      .post<any>(
        `${this.restApiUrl}/v1/api/auth/login`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        map(async (data: any) => {
          if (data.result === 'success') {
            await this.storagemode.clear();

            await this.storagemode.set('currentUser', JSON.stringify(data));

            this.currentUserSubject.next(data);
          }
          return data;
        })
      );
  }

  fetchPermissions(center_id: string, role_id: string) {
    this._commonApiService.fetchPermissions(role_id).subscribe(async (data) => {
      await this.storagemode.set('currentPermission', JSON.stringify(data));
      this.currentPermisssionSubject.next(data);
    });
  }

  async setCurrentMenu(clickedMenu) {
    await this.storagemode.set('currentMenu', clickedMenu);
    this.currentMenuSubject.next(clickedMenu);
  }

  redirectToLogin() {
    this._router.navigate([`/login`]);
  }
}
