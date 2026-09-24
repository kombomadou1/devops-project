import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { UsersUpdate } from './users-update';
import { User } from '../services/user.service';

describe('UsersUpdate', () => {
  let component: UsersUpdate;
  let fixture: ComponentFixture<UsersUpdate>;

  const mockUserService = {
    getUser: vi.fn().mockReturnValue(
      of({
        id: 1,
        lastname: 'Doe',
        firstname: 'John',
        age: 30,
        password: 'pass',
      }),
    ),
    editUser: vi.fn().mockReturnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersUpdate],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => '1',
              },
            },
          },
        },
        {
          provide: User,
          useValue: mockUserService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersUpdate);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an edit form with required fields', async () => {
    await fixture.whenStable();
    expect(component.editForm).toBeDefined();
    expect(component.editForm.contains('lastname')).toBe(true);
    expect(component.editForm.contains('firstname')).toBe(true);
    expect(component.editForm.contains('age')).toBe(true);
  });

  it('should call getUser on init with correct id', () => {
    expect(mockUserService.getUser).toHaveBeenCalledWith('1');
  });
});
