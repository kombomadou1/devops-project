import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { UsersList } from './users-list';
import { User } from '../services/user.service';

describe('UsersList', () => {
  let component: UsersList;
  let fixture: ComponentFixture<UsersList>;

  const mockHttp = {
    get: vi.fn().mockReturnValue(
      of({
        body: [
          {
            id: 1,
            lastname: 'Doe',
            firstname: 'John',
            age: 25,
            password: 'pass',
          },
        ],
      }),
    ),
  };

  const mockUserService = {
    deleteUser: vi.fn().mockReturnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersList],
      providers: [
        provideRouter([]),
        {
          provide: HttpClient,
          useValue: mockHttp,
        },
        {
          provide: User,
          useValue: mockUserService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load list of users on init', () => {
    expect(component.dataSource).toHaveLength(1);
    expect(component.filteredData).toHaveLength(1);
    expect(component.dataSource[0].firstname).toBe('John');
  });

  it('should filter users by id on search', () => {
    component.onSearchId('1');
    expect(component.filteredData).toHaveLength(1);

    component.onSearchId('999');
    expect(component.filteredData).toHaveLength(0);

    component.onSearchId('');
    expect(component.filteredData).toHaveLength(1);
  });
});
