import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NutzungsvereinbarungComponent } from './nutzungsvereinbarung.component';

describe('NutzungsvereinbarungComponent', () => {
  let component: NutzungsvereinbarungComponent;
  let fixture: ComponentFixture<NutzungsvereinbarungComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NutzungsvereinbarungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NutzungsvereinbarungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
