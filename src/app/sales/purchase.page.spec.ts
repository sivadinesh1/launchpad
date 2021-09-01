import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PurchasePage } from './sales.page';

describe('PurchasePage', () => {
  let component: PurchasePage;
  let fixture: ComponentFixture<PurchasePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PurchasePage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
