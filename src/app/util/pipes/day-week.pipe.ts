import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'day-week'
})
export class DayWeekPipe implements PipeTransform {

    weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    transform(value: string): string {
        return this.weekday[new Date().getDay()];
    }

}


