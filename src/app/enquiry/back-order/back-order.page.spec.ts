import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BackOrderPage } from './back-order.page';

describe('BackOrderPage', () => {
  let component: BackOrderPage;
  let fixture: ComponentFixture<BackOrderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackOrderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BackOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
