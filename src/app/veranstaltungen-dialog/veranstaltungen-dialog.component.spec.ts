import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VeranstaltungenDialogComponent } from './veranstaltungen-dialog.component';

describe('VeranstaltungenDialogComponent', () => {
  let component: VeranstaltungenDialogComponent;
  let fixture: ComponentFixture<VeranstaltungenDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VeranstaltungenDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VeranstaltungenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
