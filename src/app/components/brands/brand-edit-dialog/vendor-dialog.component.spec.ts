import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VendorDialogComponent } from './brand-edit-dialog.component';

describe('VendorDialogComponent', () => {
  let component: VendorDialogComponent;
  let fixture: ComponentFixture<VendorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VendorDialogComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VendorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
