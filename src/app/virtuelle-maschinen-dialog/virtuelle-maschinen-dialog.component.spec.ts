import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtuelleMaschinenDialogComponent } from './virtuelle-maschinen-dialog.component';

describe('VirtuelleMaschinenDialogComponent', () => {
  let component: VirtuelleMaschinenDialogComponent;
  let fixture: ComponentFixture<VirtuelleMaschinenDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtuelleMaschinenDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtuelleMaschinenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
