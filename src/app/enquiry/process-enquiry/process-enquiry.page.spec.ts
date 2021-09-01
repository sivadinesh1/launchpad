import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProcessEnquiryPage } from './process-enquiry.page';

describe('ProcessEnquiryPage', () => {
  let component: ProcessEnquiryPage;
  let fixture: ComponentFixture<ProcessEnquiryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessEnquiryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessEnquiryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
