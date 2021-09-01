import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditPurchasePage } from './edit-purchase.page';

describe('EditPurchasePage', () => {
  let component: EditPurchasePage;
  let fixture: ComponentFixture<EditPurchasePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPurchasePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditPurchasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
