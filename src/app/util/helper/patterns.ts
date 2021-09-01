import { CountryPhone } from '../../util/validators/country-phone.model';
import { FormControl, Validators } from '@angular/forms';

export const GSTN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PINCODE_REGEX = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export const HSNCODE_REGEX = /^\d{6}$/;

export const DISC_REGEX = /^[1-9]$|^[1-9][0-9]$|^(100)$/;

export const TWO_DECIMAL_REGEX = /^\d*(?:[.,]\d{1,2})?$/;

export const country = new FormControl(new CountryPhone('IN', 'India'), Validators.required);


