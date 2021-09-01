import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
	selector: '[appSelectOnFocus]',
})
export class SelectOnFocusDirective {
	constructor(private elementRef: ElementRef) {}

	@HostListener('focus', ['$event']) onFocus() {
		this.elementRef.nativeElement.select();
	}
}
