import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewVendorsPage } from './view-vendors.page';

describe('ViewVendorsPage', () => {
  let component: ViewVendorsPage;
  let fixture: ComponentFixture<ViewVendorsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewVendorsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewVendorsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
