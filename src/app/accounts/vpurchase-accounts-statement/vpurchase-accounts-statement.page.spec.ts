import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VpurchaseAccountsStatementPage } from './vpurchase-accounts-statement.page';

describe('VpurchaseAccountsStatementPage', () => {
  let component: VpurchaseAccountsStatementPage;
  let fixture: ComponentFixture<VpurchaseAccountsStatementPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VpurchaseAccountsStatementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VpurchaseAccountsStatementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
