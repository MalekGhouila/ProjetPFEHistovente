import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StagingReview } from './staging-review';

describe('StagingReview', () => {
  let component: StagingReview;
  let fixture: ComponentFixture<StagingReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StagingReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StagingReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
