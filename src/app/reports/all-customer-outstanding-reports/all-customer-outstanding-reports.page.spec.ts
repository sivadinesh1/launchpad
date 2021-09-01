import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AllCustomerOutstandingReportsPage } from './all-customer-outstanding-reports.page';

describe('AllCustomerOutstandingReportsPage', () => {
  let component: AllCustomerOutstandingReportsPage;
  let fixture: ComponentFixture<AllCustomerOutstandingReportsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AllCustomerOutstandingReportsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AllCustomerOutstandingReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
