import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HideAccountComponent } from './hide-account.component';

describe('HideAccountComponent', () => {
  let component: HideAccountComponent;
  let fixture: ComponentFixture<HideAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HideAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HideAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
