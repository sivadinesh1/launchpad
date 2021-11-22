import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FinancialCustomerPage } from './financial-customer.page';

describe('FinancialCustomerPage', () => {
    let component: FinancialCustomerPage;
    let fixture: ComponentFixture<FinancialCustomerPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FinancialCustomerPage],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(FinancialCustomerPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
