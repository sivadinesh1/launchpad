import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StatementReportsPage } from './statement-reports.page';

describe('StatementReportsPage', () => {
  let component: StatementReportsPage;
  let fixture: ComponentFixture<StatementReportsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatementReportsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StatementReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
