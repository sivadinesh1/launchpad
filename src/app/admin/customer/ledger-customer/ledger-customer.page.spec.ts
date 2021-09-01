import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LedgerCustomerPage } from './ledger-customer.page';

describe('LedgerCustomerPage', () => {
  let component: LedgerCustomerPage;
  let fixture: ComponentFixture<LedgerCustomerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgerCustomerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LedgerCustomerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
