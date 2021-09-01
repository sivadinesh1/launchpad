import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'pricePipe',
})
export class PricePipePipe implements PipeTransform {
	transform(value: number): any {
		if (!isNaN(value)) {
			var currencySymbol = '₹';
			if (value == null) {
				return '';
			}
			var InrRSOut = value;
			InrRSOut = Math.round(InrRSOut);
			var RV = '';
			if (InrRSOut > 0 && InrRSOut < 1000) {
				RV = InrRSOut.toString();
			} else if (InrRSOut >= 1000 && InrRSOut < 10000) {
				RV = InrRSOut.toString();
			} else if (InrRSOut >= 10000 && InrRSOut < 100000) {
				var f1 = InrRSOut.toString().substring(0, 2);
				var f2 = InrRSOut.toString().substring(2, 5);
				RV = f1 + ',' + f2;
			} else if (InrRSOut >= 100000 && InrRSOut < 1000000) {
				var f1 = InrRSOut.toString().substring(0, 1);
				var f2 = InrRSOut.toString().substring(1, 3);
				if (f2 == '00') {
					RV = f1 + ' L';
				} else {
					RV = f1 + '.' + f2 + ' L';
				}
			} else if (InrRSOut >= 1000000 && InrRSOut < 10000000) {
				var f1 = InrRSOut.toString().substring(0, 2);
				var f2 = InrRSOut.toString().substring(2, 4);
				if (f2 == '00') {
					RV = f1 + ' L';
				} else {
					RV = f1 + '.' + f2 + ' L';
				}
			} else if (InrRSOut >= 10000000 && InrRSOut < 100000000) {
				var f1 = InrRSOut.toString().substring(0, 1);
				var f2 = InrRSOut.toString().substring(1, 3);
				if (f2 == '00') {
					RV = f1 + ' Cr';
				} else {
					RV = f1 + '.' + f2 + ' Cr';
				}
			} else if (InrRSOut >= 100000000 && InrRSOut < 1000000000) {
				var f1 = InrRSOut.toString().substring(0, 2);
				var f2 = InrRSOut.toString().substring(2, 4);
				if (f2 == '00') {
					RV = f1 + ' Cr';
				} else {
					RV = f1 + '.' + f2 + ' Cr';
				}
			} else if (InrRSOut >= 1000000000 && InrRSOut < 10000000000) {
				var f1 = InrRSOut.toString().substring(0, 3);
				var f2 = InrRSOut.toString().substring(3, 5);
				if (f2 == '00') {
					RV = f1 + ' Cr';
				} else {
					RV = f1 + '.' + f2 + ' Cr';
				}
			} else if (InrRSOut >= 10000000000) {
				var f1 = InrRSOut.toString().substring(0, 4);
				var f2 = InrRSOut.toString().substring(6, 8);
				if (f2 == '00') {
					RV = f1 + ' Cr';
				} else {
					RV = f1 + '.' + f2 + ' Cr';
				}
			} else {
				RV = InrRSOut.toString();
			}
			return currencySymbol + RV;
		}
	}
}
