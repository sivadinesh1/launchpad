import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nulldash'
})
export class NullToDashPipe implements PipeTransform {

  transform(value: any): any {
    if (value == null) {
        return '-';
      } else if ( value === '') {
        return '-';
      } else if ( value === 'undefined') {
        return '-';
      } else {
        return value;
      }
  }

}


