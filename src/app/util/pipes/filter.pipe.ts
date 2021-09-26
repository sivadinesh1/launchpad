import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appFilter' })
export class FilterPipe implements PipeTransform {
    /**
     * Transform
     *
     * @param items
     * @param searchText
     * @returns
     */
    transform(items: any[], searchText: string): any[] {
        if (!items) {
            return [];
        }
        if (!searchText) {
            return items;
        }
        searchText = searchText.toLocaleLowerCase();

        return items.filter(it => (it.product_desc.toLocaleLowerCase().includes(searchText) || it.product_code.toLocaleLowerCase().includes(searchText)));
    }
}
