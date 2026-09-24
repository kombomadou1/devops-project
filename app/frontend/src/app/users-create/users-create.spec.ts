import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { UsersCreate } from './users-create';
import { User } from '../services/user.service';

describe('UsersCreate', () => {
  let component: UsersCreate;
  let fixture: ComponentFixture<UsersCreate>;

  const mockUserService = {
    createUser: vi.fn().mockReturnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersCreate],
      providers: [
        {
          provide: User,
          useValue: mockUserService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.userForm.valid).toBe(false);
  });

  it('should have a valid form with correct values', () => {
    component.userForm.patchValue({
      lastname: 'Smith',
      firstname: 'Alice',
      age: 28,
      password: 'password123',
    });

    expect(component.userForm.valid).toBe(true);
  });

  it('should call createUser on submit with valid form', () => {
    component.userForm.patchValue({
      lastname: 'Smith',
      firstname: 'Alice',
      age: 28,
      password: 'password123',
    });

    component.onSubmit();
    expect(mockUserService.createUser).toHaveBeenCalled();
  });
});
