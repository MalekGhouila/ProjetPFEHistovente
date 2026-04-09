import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataMonitoring } from './data-monitoring';

describe('DataMonitoring', () => {
  let component: DataMonitoring;
  let fixture: ComponentFixture<DataMonitoring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataMonitoring]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataMonitoring);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
