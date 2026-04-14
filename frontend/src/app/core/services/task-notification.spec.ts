import { TestBed } from '@angular/core/testing';

import { TaskNotification } from './task-notification';

describe('TaskNotification', () => {
  let service: TaskNotification;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskNotification);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
