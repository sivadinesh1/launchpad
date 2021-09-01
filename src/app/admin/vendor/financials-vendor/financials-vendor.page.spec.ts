import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FinancialsVendorPage } from './financials-vendor.page';

describe('FinancialsVendorPage', () => {
  let component: FinancialsVendorPage;
  let fixture: ComponentFixture<FinancialsVendorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinancialsVendorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FinancialsVendorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
