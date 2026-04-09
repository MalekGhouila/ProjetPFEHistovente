import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtRisk } from './at-risk';

describe('AtRisk', () => {
  let component: AtRisk;
  let fixture: ComponentFixture<AtRisk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtRisk]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtRisk);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
