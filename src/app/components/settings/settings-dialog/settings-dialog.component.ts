import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsDialogComponent implements OnInit {



  constructor(private _commonApiService: CommonApiService, private _modalcontroller: ModalController,
    private _cdr: ChangeDetectorRef, private _router: Router,
  ) {

  }

  ngOnInit() { }



  ionViewDidEnter() {


  }



  save() {

  }



  closeModal() {
    this._modalcontroller.dismiss();
  }

  test() {

    this._router.navigate([`(settings:general-settings)`]);
  }

}
