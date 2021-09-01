import { Directive, Input, Renderer2, ElementRef } from '@angular/core'

@Directive({
    selector: '[focused]'
})

export class FocusedDirective {

    @Input()
    set focused(value: boolean) {
        if (value) {
            //     this._renderer.invokeElementMethod(this.elementRef.nativeElement, 'scrollIntoViewIfNeeded');
            this._renderer.selectRootElement('#dataw', true).scrollIntoView()
        }
    }

    constructor(private elementRef: ElementRef, private _renderer: Renderer2) { }
}