import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewBrandsPage } from './view-brands.page';

describe('ViewBrandsPage', () => {
  let component: ViewBrandsPage;
  let fixture: ComponentFixture<ViewBrandsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBrandsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewBrandsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
