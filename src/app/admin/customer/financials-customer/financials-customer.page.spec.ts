import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FinancialsCustomerPage } from './financials-customer.page';

describe('FinancialsCustomerPage', () => {
  let component: FinancialsCustomerPage;
  let fixture: ComponentFixture<FinancialsCustomerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinancialsCustomerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FinancialsCustomerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
