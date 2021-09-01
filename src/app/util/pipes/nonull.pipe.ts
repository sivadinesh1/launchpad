import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'noNull'})
export class NoNullPipe implements PipeTransform {

  constructor() {}

  transform(num: number | null): number {
    return num ? num : 0;
  }
}