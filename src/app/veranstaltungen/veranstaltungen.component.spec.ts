import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VeranstaltungenComponent } from './veranstaltungen.component';

describe('VeranstaltungenComponent', () => {
  let component: VeranstaltungenComponent;
  let fixture: ComponentFixture<VeranstaltungenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VeranstaltungenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VeranstaltungenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
