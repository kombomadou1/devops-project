import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AssociationDetails } from './association-details';

describe('AssociationDetails', () => {
  let component: AssociationDetails;
  let fixture: ComponentFixture<AssociationDetails>;

  const mockHttp = {
    get: vi.fn().mockImplementation((url: string) => {
      if (url.includes('/minutes')) {
        return of({ body: [] });
      }
      return of({
        body: {
          id: 1,
          name: 'Assoc Test',
          members: [],
        },
      });
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationDetails],
      providers: [
        provideRouter([]),
        {
          provide: HttpClient,
          useValue: mockHttp,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            url: of([{ path: 'associations' }, { path: '1' }]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssociationDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load association details and minutes', () => {
    expect(component.idUrl).toBe('1');
    expect(component.dataSource).toBeDefined();
    expect(component.dataSource.name).toBe('Assoc Test');
  });
});
