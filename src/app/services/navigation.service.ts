import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  roletype: any;

  constructor(private _router: Router, private _authservice: AuthenticationService) {
    this.getAsyncData();
  }



  async getAsyncData() {
    // this.roletype = await <any>this._authservice.getItems('USER_ROLE');
  }

  goToDashboard() {

    // if (this.roletype === 'centeradmin') {
    //   this._router.navigateByUrl('/tab/tabs/home/center-admin-dashboard');
    // } else if (this.roletype === 'membercoordinator') {
    //   this._router.navigateByUrl('/tabs/home/mc-dashboard');
    // } else if (this.roletype === 'trainer') {
    //   this._router.navigateByUrl('/tabs/home/trainer-dashboard');
    // } else if (this.roletype === 'member') {
    //   this._router.navigateByUrl('/tabs/home/member-dashboard');
    // }

  }

  searchCustomers() {
    this._router.navigate([`/home/view-customers`]);
  }

}
