import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatenschutzerklaerungComponent } from './datenschutzerklaerung.component';

describe('DatenschutzerklaerungComponent', () => {
  let component: DatenschutzerklaerungComponent;
  let fixture: ComponentFixture<DatenschutzerklaerungComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatenschutzerklaerungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatenschutzerklaerungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
