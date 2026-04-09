import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dormant } from './dormant';

describe('Dormant', () => {
  let component: Dormant;
  let fixture: ComponentFixture<Dormant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dormant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dormant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
