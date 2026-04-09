import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataQuality } from './data-quality';

describe('DataQuality', () => {
  let component: DataQuality;
  let fixture: ComponentFixture<DataQuality>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataQuality]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataQuality);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
