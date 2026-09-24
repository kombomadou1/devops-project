import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersCreate } from './users-create';

describe('UsersCreate', () => {
  let component: UsersCreate;
  let fixture: ComponentFixture<UsersCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
