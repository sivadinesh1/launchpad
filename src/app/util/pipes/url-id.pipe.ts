import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'url-id'
})
export class UrlidPipe implements PipeTransform {

  transform(value: string): string {
    return value.substring(value.length, value.lastIndexOf('-')+1) ;
  }

}

