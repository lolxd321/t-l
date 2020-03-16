import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbQueriesComponent } from './db-queries.component';

describe('DbQueriesComponent', () => {
  let component: DbQueriesComponent;
  let fixture: ComponentFixture<DbQueriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbQueriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
