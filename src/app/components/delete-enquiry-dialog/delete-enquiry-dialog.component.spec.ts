import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeleteEnquiryDialogComponent } from './delete-enquiry-dialog.component';

describe('DeleteEnquiryDialogComponent', () => {
  let component: DeleteEnquiryDialogComponent;
  let fixture: ComponentFixture<DeleteEnquiryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteEnquiryDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteEnquiryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
