import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'sup-date'
})
export class SupDatePipe implements PipeTransform {

  transform(value: string): string {
    return moment().format( 'Do MMMM YYYY' ).replace( /(\d)(st|nd|rd|th)/g, '$1<sup>$2</sup>' );

  }

}



