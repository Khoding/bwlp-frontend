import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtuelleMaschinenComponent } from './virtuelle-maschinen.component';

describe('VirtuelleMaschinenComponent', () => {
  let component: VirtuelleMaschinenComponent;
  let fixture: ComponentFixture<VirtuelleMaschinenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtuelleMaschinenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtuelleMaschinenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
