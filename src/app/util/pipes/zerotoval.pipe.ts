import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'zeroToVal' })
export class ZeroToValPipe implements PipeTransform {

    constructor() { }

    transform(value: any, ellipsis: string) {

        if (value === 0) {
            return `${ellipsis}`;
        } else {
            return value;
        }


    }
}
