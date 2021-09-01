import { TestBed } from '@angular/core/testing';

import { CommonApiService } from './common-api.service';

describe('CommonApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CommonApiService = TestBed.get(CommonApiService);
    expect(service).toBeTruthy();
  });
});
