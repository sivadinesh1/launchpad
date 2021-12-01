import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustomerBalanceReportsPage } from './customer-balance-reports.page';

describe('CustomerBalanceReportsPage', () => {
    let component: CustomerBalanceReportsPage;
    let fixture: ComponentFixture<CustomerBalanceReportsPage>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [CustomerBalanceReportsPage],
                imports: [IonicModule.forRoot()],
            }).compileComponents();

            fixture = TestBed.createComponent(CustomerBalanceReportsPage);
            component = fixture.componentInstance;
            fixture.detectChanges();
        })
    );

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
