import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BewerbungComponent } from './bewerbung.component';

describe('BewerbungComponent', () => {
  let component: BewerbungComponent;
  let fixture: ComponentFixture<BewerbungComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BewerbungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BewerbungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
