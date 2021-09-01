import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchPurchasePage } from './search-purchase.page';

describe('SearchPurchasePage', () => {
  let component: SearchPurchasePage;
  let fixture: ComponentFixture<SearchPurchasePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchPurchasePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPurchasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
