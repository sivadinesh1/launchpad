import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ItemWiseSaleReportsPage } from './item-wise-sale-reports.page';

describe('ItemWiseSaleReportsPage', () => {
  let component: ItemWiseSaleReportsPage;
  let fixture: ComponentFixture<ItemWiseSaleReportsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemWiseSaleReportsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemWiseSaleReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
