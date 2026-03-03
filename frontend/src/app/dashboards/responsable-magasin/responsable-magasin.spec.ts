import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsableMagasin } from './responsable-magasin';

describe('ResponsableMagasin', () => {
  let component: ResponsableMagasin;
  let fixture: ComponentFixture<ResponsableMagasin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsableMagasin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponsableMagasin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
