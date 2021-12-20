import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeletePaymentDialogComponent } from './delete-payments-dialog.component';

describe('DeletePaymentDialogComponent', () => {
    let component: DeletePaymentDialogComponent;
    let fixture: ComponentFixture<DeletePaymentDialogComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [DeletePaymentDialogComponent],
                imports: [IonicModule.forRoot()],
            }).compileComponents();

            fixture = TestBed.createComponent(DeletePaymentDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        })
    );

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
