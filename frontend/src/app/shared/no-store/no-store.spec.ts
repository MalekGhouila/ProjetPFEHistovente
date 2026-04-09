import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoStore } from './no-store';

describe('NoStore', () => {
  let component: NoStore;
  let fixture: ComponentFixture<NoStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoStore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoStore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
