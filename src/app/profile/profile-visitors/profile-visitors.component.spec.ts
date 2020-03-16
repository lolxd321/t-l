import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileVisitorsComponent } from './profile-visitors.component';

describe('ProfileVisitorsComponent', () => {
  let component: ProfileVisitorsComponent;
  let fixture: ComponentFixture<ProfileVisitorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileVisitorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileVisitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
