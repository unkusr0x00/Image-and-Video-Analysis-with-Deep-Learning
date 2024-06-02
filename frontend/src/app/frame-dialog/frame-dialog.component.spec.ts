import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameDialogComponent } from './frame-dialog.component';

describe('FrameDialogComponent', () => {
  let component: FrameDialogComponent;
  let fixture: ComponentFixture<FrameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FrameDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FrameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
