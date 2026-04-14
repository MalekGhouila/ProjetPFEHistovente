import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAnalysis } from './custom-analysis';

describe('CustomAnalysis', () => {
  let component: CustomAnalysis;
  let fixture: ComponentFixture<CustomAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomAnalysis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomAnalysis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
