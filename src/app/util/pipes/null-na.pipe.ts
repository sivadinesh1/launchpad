import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nullna'
})
export class NullToNaPipe implements PipeTransform {

  transform(value: any): any {
    if (value == null) {
      return 'N/A';
    } else if (value === 'null') {
      return '';
    } else if (value === '') {
      return 'N/A';
    } else if (value === 'undefined') {
      return 'N/A';
    } else {
      return value.toString();
    }
  }

}


