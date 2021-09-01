import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductSummaryReportsPage } from './product-summary-reports.page';

describe('ProductSummaryReportsPage', () => {
  let component: ProductSummaryReportsPage;
  let fixture: ComponentFixture<ProductSummaryReportsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductSummaryReportsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductSummaryReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
