import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OpenEnquiryPage } from './open-enquiry.page';

describe('OpenEnquiryPage', () => {
  let component: OpenEnquiryPage;
  let fixture: ComponentFixture<OpenEnquiryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenEnquiryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OpenEnquiryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
