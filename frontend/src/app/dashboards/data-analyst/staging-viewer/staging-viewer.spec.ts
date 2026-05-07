import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StagingViewer } from './staging-viewer';

describe('StagingViewer', () => {
  let component: StagingViewer;
  let fixture: ComponentFixture<StagingViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StagingViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StagingViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
