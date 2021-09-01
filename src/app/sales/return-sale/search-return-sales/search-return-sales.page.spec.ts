import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchReturnSalesPage } from './search-return-sales.page';

describe('SearchReturnSalesPage', () => {
  let component: SearchReturnSalesPage;
  let fixture: ComponentFixture<SearchReturnSalesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchReturnSalesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchReturnSalesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
