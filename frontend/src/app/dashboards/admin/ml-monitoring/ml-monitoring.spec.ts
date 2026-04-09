import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlMonitoring } from './ml-monitoring';

describe('MlMonitoring', () => {
  let component: MlMonitoring;
  let fixture: ComponentFixture<MlMonitoring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MlMonitoring]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MlMonitoring);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
