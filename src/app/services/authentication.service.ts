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
    public currentUser: Observable<User> =
        this.currentUserSubject.asObservable();

    private currentMenuSubject = new BehaviorSubject<any>(null);
    public currentMenu: Observable<any> =
        this.currentMenuSubject.asObservable();

    private currentPermissionSubject = new BehaviorSubject<any>(null);
    public currentPermission: Observable<any> =
        this.currentPermissionSubject.asObservable();

    restApiUrl = environment.restApiUrl;

    storage_mode: any;
    device: any;
    error_msg = 'Something went wrong. Contact administrator.';

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
                this.storage_mode = this.storage;
                this.device = 'browser';
            } else {
                this.device = 'mobile';
            }

            this.reloadLocalStorage();
        });
    }

    async reloadLocalStorage() {
        const tempCurrentUser = await this.getLocalStoreItems('currentUser');
        const tempMenuUser = await this.getLocalStoreItems('currentMenu');
        const tempCurrentPermission = await this.getLocalStoreItems(
            'currentPermission'
        );

        if (tempCurrentUser) {
            this.currentUserSubject.next(JSON.parse(tempCurrentUser));
        }
        if (tempMenuUser) {
            this.currentMenuSubject.next(tempMenuUser);
        }

        if (tempCurrentPermission) {
            this.currentPermissionSubject.next(tempCurrentPermission);
        }
    }

    async setLocalStoreItems(key, value) {
        await this.storage_mode.set(key, value);
    }

    async getLocalStoreItems(key): Promise<string> {
        return await this.storage_mode.get(key);
    }

    register(username, password) {
        return this.httpClient
            .post<any>(`${this.restApiUrl}/v1/api/register`, {
                username,
                password,
            })
            .pipe(
                map(async (user_data: any) => {
                    await this.storage_mode.clear();

                    const tokenStr = 'Bearer ' + user_data.additional_info;

                    await this.storage_mode.set('username', username);
                    await this.storage_mode.set('token', tokenStr);
                    await this.storage_mode.set(
                        'currentUser',
                        JSON.stringify(user_data.obj)
                    );

                    this.currentUserSubject.next(user_data.obj);

                    return user_data;
                })
            );
    }

    async logOut() {
        await this.storage_mode.clear();
        this.currentUserSubject.next(null);
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    superAdmin(center_id: string) {
        return this.httpClient
            .post<any>(`${this.restApiUrl}/v1/api/auth/super-admin`, {
                center_id,
            })
            .pipe(
                map(async (data: any) => {
                    if (data.result === 'success') {
                        await this.storage_mode.clear();

                        await this.storage_mode.set(
                            'currentUser',
                            JSON.stringify(data)
                        );

                        this.currentUserSubject.next(data);
                    }
                    return data;
                })
            );
    }

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
                        await this.storage_mode.clear();

                        await this.storage_mode.set(
                            'currentUser',
                            JSON.stringify(data)
                        );

                        this.currentUserSubject.next(data);
                    }
                    return data;
                })
            );
    }

    fetchPermissions(center_id: string, role_id: string) {
        this._commonApiService
            .fetchPermissions(role_id)
            .subscribe(async (data) => {
                await this.storage_mode.set(
                    'currentPermission',
                    JSON.stringify(data)
                );
                this.currentPermissionSubject.next(data);
            });
    }

    async setCurrentMenu(clickedMenu) {
        await this.storage_mode.set('currentMenu', clickedMenu);
        this.currentMenuSubject.next(clickedMenu);
    }

    redirectToLogin() {
        this._router.navigate([`/login`]);
    }
}
