import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FakesComponent } from './fakes.component';

describe('FakesComponent', () => {
  let component: FakesComponent;
  let fixture: ComponentFixture<FakesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FakesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FakesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
