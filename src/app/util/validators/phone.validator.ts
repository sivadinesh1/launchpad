import { AbstractControl, ValidatorFn } from '@angular/forms';

import libphonenumber from 'google-libphonenumber';

export class PhoneValidator {

  // Validate if a phone number belongs to a certain country.
  // If our validation fails, we return an object with a key for the error name and a value of true.
  // Otherwise, if the validation passes, we simply return null because there is no error.

  static invalidCountryPhone = (countryControl: AbstractControl): ValidatorFn => {
    let subscribe = false;

    return (phoneControl: AbstractControl): { [key: string]: boolean } => {
      if (!subscribe) {
        subscribe = true;
        countryControl.valueChanges.subscribe(() => {
          phoneControl.updateValueAndValidity();
        });
      }

      if (phoneControl.value !== '') {
        try {
          const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
          const phoneNumber = '' + phoneControl.value + '',
            region = countryControl.value.iso,
            number = phoneUtil.parse(phoneNumber, region),
            isValidNumber = phoneUtil.isValidNumber(number);

          if (isValidNumber) {
            return null;
          }
        } catch (e) {
          return {
            invalidCountryPhone: true
          };
        }

        return {
          invalidCountryPhone: true
        };
      } else {
        return null;
      }
    };
  }
}


// npm install --save google-libphonenumber
// https://stackoverflow.com/questions/49293864/how-to-use-google-libphonenumber-in-typescript?rq=1
// if installed as @Type then functions can be directly called, but now its libphonenumber.PhoneNumberUtil.getut..