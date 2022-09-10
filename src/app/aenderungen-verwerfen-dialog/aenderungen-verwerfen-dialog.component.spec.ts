import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AenderungenVerwerfenDialogComponent } from './aenderungen-verwerfen-dialog.component';

describe('AenderungenVerwerfenDialogComponent', () => {
  let component: AenderungenVerwerfenDialogComponent;
  let fixture: ComponentFixture<AenderungenVerwerfenDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AenderungenVerwerfenDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AenderungenVerwerfenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
