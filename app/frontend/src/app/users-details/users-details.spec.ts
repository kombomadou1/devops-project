import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { UsersDetails } from './users-details';
import { User } from '../services/user.service';

describe('UsersDetails', () => {
  let component: UsersDetails;
  let fixture: ComponentFixture<UsersDetails>;

  const mockUserService = {
    getAllAssociations: vi.fn().mockReturnValue(of([{ id: 1, name: 'Assoc 1' }])),
    getAllUsers: vi.fn().mockReturnValue(
      of([
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          roles: [{ idUser: 1, idAssociation: 1, name: 'President' }],
        },
      ]),
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersDetails],
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

    fixture = TestBed.createComponent(UsersDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user and associations on init', () => {
    expect(component.userId).toBe(1);
    expect(component.user).toBeDefined();
    expect(component.user.firstname).toBe('John');
    expect(component.user.roles[0].associationName).toBe('Assoc 1');
  });
});
