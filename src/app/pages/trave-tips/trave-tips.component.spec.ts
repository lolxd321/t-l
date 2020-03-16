import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraveTipsComponent } from './trave-tips.component';

describe('TraveTipsComponent', () => {
  let component: TraveTipsComponent;
  let fixture: ComponentFixture<TraveTipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraveTipsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraveTipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
