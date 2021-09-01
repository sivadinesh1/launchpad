import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConvertToSaleDialogComponent } from './convert-to-sale-dialog.component';

describe('ConvertToSaleDialogComponent', () => {
  let component: ConvertToSaleDialogComponent;
  let fixture: ComponentFixture<ConvertToSaleDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConvertToSaleDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConvertToSaleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
