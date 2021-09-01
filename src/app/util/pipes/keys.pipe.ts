import { Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'keys'})
 export class CustomPipe implements PipeTransform {
transform(value, args: string[]): any {
  if (!value) {
     return value;
  }


  const keys = [];

 // tslint:disable-next-line:forin
 for (const key in value) {
   keys.push({key: key, value: value[key]});
   }
   return keys;
 }

}