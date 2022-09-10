import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVeranstaltungComponent } from './create-veranstaltung.component';

describe('CreateVeranstaltungComponent', () => {
  let component: CreateVeranstaltungComponent;
  let fixture: ComponentFixture<CreateVeranstaltungComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateVeranstaltungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateVeranstaltungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
