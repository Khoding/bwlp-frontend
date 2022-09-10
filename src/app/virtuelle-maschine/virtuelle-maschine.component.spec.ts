import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtuelleMaschineComponent } from './virtuelle-maschine.component';

describe('VirtuelleMaschineComponent', () => {
  let component: VirtuelleMaschineComponent;
  let fixture: ComponentFixture<VirtuelleMaschineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtuelleMaschineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtuelleMaschineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
