import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReportsHomePage } from './reports-home.page';

describe('ReportsHomePage', () => {
  let component: ReportsHomePage;
  let fixture: ComponentFixture<ReportsHomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsHomePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
