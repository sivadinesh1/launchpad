import { Injectable } from '@angular/core';
import {
	LoadingController,
	ToastController,
	AlertController,
} from '@ionic/angular';

import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
	providedIn: 'root',
})
export class LoadingService {
	isLoading = false;

	constructor(
		private loadingController: LoadingController,
		private _router: Router,
		private _snackBar: MatSnackBar,
		private alertctrl: AlertController,
		private toastController: ToastController
	) {}

	async present(msg) {
		this.isLoading = true;
		return await this.loadingController
			.create({
				message: msg,
				cssClass: 'custom-loader-class',
				spinner: 'lines',
			})
			.then((res) => {
				res.present().then(() => {
					console.log('presented');
					if (!this.isLoading) {
						res.dismiss().then(() => console.log('abort presenting'));
					}
				});

				res.onDidDismiss().then((dis) => {
					console.log('Loading dismissed!');
				});
			});
	}

	/**
	 * simple dismiss function
	 */
	async dismiss() {
		this.isLoading = false;
		return await this.loadingController.dismiss().then(() => {
			console.log('dismissed');
		});
	}

	async routeAfter(timer, url, toastmsg, pos, isclose, btncaption) {
		this.presentToastWithOptions(toastmsg, pos, isclose, btncaption);
		setTimeout(() => {
			this._router.navigateByUrl(url);
		}, timer);
	}

	async presentToast(msg) {
		const toast = await this.toastController.create({
			message: msg,
			duration: 2000,
		});
		toast.present();
	}

	async presentToastWithOptions(msg, pos, isclose, btncaption) {
		const toast = await this.toastController.create({
			message: msg,

			position: pos,
			duration: 2000,
			color: 'primary',
			buttons: [{ text: 'Close', role: 'cancel' }],
		});
		toast.present();
	}

	// confirm(message?: string) {
	//   const confirmation = window.confirm(message || 'Are you sure?');
	//   console.log('confirm ' + confirmation);
	//   return (confirmation) ? true : false;

	// }

	async showAlert() {
		let alert = await this.alertctrl.create({
			header: 'Unauthorized',
			message: 'You are not authorized to visit this page!',
			buttons: ['OK'],
		});
		alert.present();
	}

	async confirmLeaving(url, form) {
		const alert = await this.alertctrl.create({
			header: 'Attention !',
			message: 'You have unsaved changes. Are you sure you want to leave?',
			buttons: [
				{
					text: 'Stay',
					role: 'cancel',
					cssClass: 'secondary',
					handler: (blah) => {},
				},
				{
					text: 'Leave',
					handler: () => {
						this._router.navigate([url]); //Change **URL_Back_Route** for your Router
						form.markAsPristine();
						form.markAsUntouched();
					},
				},
			],
		});

		await alert.present();
	}

	async confirmLeaving1(url, form) {
		const alert = await this.alertctrl.create({
			header: 'Attention !',
			message: 'You have unsaved changes. Are you sure you want to leave?',
			buttons: [
				{
					text: 'Stay',
					role: 'cancel',
					cssClass: 'secondary',
					handler: (blah) => {},
				},
				{
					text: 'Leave',
					handler: () => {
						this._router.navigate([url]); //Change **URL_Back_Route** for your Router
						form.markAsPristine();
						form.markAsUntouched();
					},
				},
			],
		});

		await alert.present();
	}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 2000,
			panelClass: ['mat-toolbar', 'mat-primary'],
		});
	}
}
