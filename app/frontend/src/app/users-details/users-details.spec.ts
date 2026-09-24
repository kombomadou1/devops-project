import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersDetails } from './users-details';

describe('UsersDetails', () => {
  let component: UsersDetails;
  let fixture: ComponentFixture<UsersDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
