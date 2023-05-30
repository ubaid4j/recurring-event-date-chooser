import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomRecurrenceInputComponent } from './custom-recurrence-input.component';

describe('CustomRecurrenceInputComponent', () => {
  let component: CustomRecurrenceInputComponent;
  let fixture: ComponentFixture<CustomRecurrenceInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomRecurrenceInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomRecurrenceInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
