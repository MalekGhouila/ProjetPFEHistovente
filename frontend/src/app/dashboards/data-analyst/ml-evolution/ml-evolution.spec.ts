import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlEvolution } from './ml-evolution';

describe('MlEvolution', () => {
  let component: MlEvolution;
  let fixture: ComponentFixture<MlEvolution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MlEvolution]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MlEvolution);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
