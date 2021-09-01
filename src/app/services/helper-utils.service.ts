import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class HelperUtilsService {
	constructor() {}

	generateFake(count: number): Array<number> {
		const indexes = [];
		for (let i = 0; i < count; i++) {
			if (i % 2) {
				indexes.push({ i: 250, j: 85 });
			} else {
				indexes.push({ i: 200, j: 125 });
			}
		}
		return indexes;
	}
}
