import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchInvoiceNoComponent } from './search-invoice-no.component';

describe('SearchInvoiceNoComponent', () => {
    let component: SearchInvoiceNoComponent;
    let fixture: ComponentFixture<SearchInvoiceNoComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [SearchInvoiceNoComponent],
                imports: [IonicModule.forRoot()],
            }).compileComponents();

            fixture = TestBed.createComponent(SearchInvoiceNoComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        })
    );

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
