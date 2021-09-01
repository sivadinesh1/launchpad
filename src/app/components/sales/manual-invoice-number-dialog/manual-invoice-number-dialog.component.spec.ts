import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ManualInvoiceNumberDialogComponent } from './manual-invoice-number-dialog.component';

describe('ManualInvoiceNumberDialogComponent', () => {
  let component: ManualInvoiceNumberDialogComponent;
  let fixture: ComponentFixture<ManualInvoiceNumberDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualInvoiceNumberDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ManualInvoiceNumberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
