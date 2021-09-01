import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonApiService } from '../../services/common-api.service';
import { ModalController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-show-vendors',
  templateUrl: './show-vendors.component.html',
  styleUrls: ['./show-vendors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowVendorsComponent implements OnInit {
  vendordata: any;
  center_id: any;

  constructor(private _commonApiService: CommonApiService, private _authservice: AuthenticationService,
    private _modalcontroller: ModalController,
    private _cdr: ChangeDetectorRef) {
    const currentUser = this._authservice.currentUserValue;
    this.center_id = currentUser.center_id;

  }

  ngOnInit() {

    this._commonApiService.getAllActiveVendors(this.center_id).subscribe(data => {
      this.vendordata = data;

      this._cdr.markForCheck();
    });
  }


  async addVendor(item) {
    await this._modalcontroller.dismiss(item);
  }

  closeModal() {
    this._modalcontroller.dismiss();
  }


}
