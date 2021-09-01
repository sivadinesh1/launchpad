import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VpurchaseAccountsPaymentsPage } from './vpurchase-accounts-payments.page';

describe('VpurchaseAccountsPaymentsPage', () => {
  let component: VpurchaseAccountsPaymentsPage;
  let fixture: ComponentFixture<VpurchaseAccountsPaymentsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VpurchaseAccountsPaymentsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VpurchaseAccountsPaymentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
