import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchSalesPage } from './search-sales.page';

describe('SearchSalesPage', () => {
  let component: SearchSalesPage;
  let fixture: ComponentFixture<SearchSalesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchSalesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchSalesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
