import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationsleisteComponent } from './navigationsleiste.component';

describe('NavigationsleisteComponent', () => {
  let component: NavigationsleisteComponent;
  let fixture: ComponentFixture<NavigationsleisteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigationsleisteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationsleisteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
