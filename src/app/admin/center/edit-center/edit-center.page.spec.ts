import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditCenterPage } from './edit-center.page';

describe('EditCenterPage', () => {
  let component: EditCenterPage;
  let fixture: ComponentFixture<EditCenterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCenterPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditCenterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
