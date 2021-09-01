import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VendorStatementReportsPage } from './vendor-statement-reports.page';

describe('VendorStatementReportsPage', () => {
  let component: VendorStatementReportsPage;
  let fixture: ComponentFixture<VendorStatementReportsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorStatementReportsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VendorStatementReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
