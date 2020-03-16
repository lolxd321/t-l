import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestPhotoComponent } from './request-photo.component';

describe('RequestPhotoComponent', () => {
  let component: RequestPhotoComponent;
  let fixture: ComponentFixture<RequestPhotoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestPhotoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestPhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
