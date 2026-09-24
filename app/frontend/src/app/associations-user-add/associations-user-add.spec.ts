import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AssociationsUserAdd } from './associations-user-add';

describe('AssociationsUserAdd', () => {
  let component: AssociationsUserAdd;
  let fixture: ComponentFixture<AssociationsUserAdd>;

  const mockHttp = {
    get: vi.fn().mockImplementation((url: string) => {
      if (url.includes('/users')) {
        return of({ body: [{ id: 1, firstname: 'John', lastname: 'Doe' }] });
      }
      return of({
        body: {
          id: 1,
          name: 'Assoc Test',
        },
      });
    }),
    post: vi.fn().mockReturnValue(of({ body: {} })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationsUserAdd],
      providers: [
        provideRouter([]),
        {
          provide: HttpClient,
          useValue: mockHttp,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            url: of([{ path: 'associations' }, { path: '1' }, { path: 'create-role' }]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssociationsUserAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load association and users data on init', () => {
    expect(component.idUrl).toBe('1');
    expect(component.associationData).toBeDefined();
    expect(component.associationData.name).toBe('Assoc Test');
    expect(component.userData).toHaveLength(1);
  });
});
