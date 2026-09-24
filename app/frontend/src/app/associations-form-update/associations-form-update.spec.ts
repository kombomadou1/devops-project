import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AssociationsFormUpdate } from './associations-form-update';

describe('AssociationsFormUpdate', () => {
  let component: AssociationsFormUpdate;
  let fixture: ComponentFixture<AssociationsFormUpdate>;

  const mockHttp = {
    get: vi.fn().mockReturnValue(
      of({
        body: {
          id: 1,
          name: 'Assoc Test',
        },
      }),
    ),
    put: vi.fn().mockReturnValue(of({ body: {} })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationsFormUpdate],
      providers: [
        provideRouter([]),
        {
          provide: HttpClient,
          useValue: mockHttp,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            url: of([{ path: 'associations' }, { path: 'update' }, { path: '1' }]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssociationsFormUpdate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load association data on init', () => {
    expect(component.idUrl).toBe('1');
    expect(component.associationName).toBe('Assoc Test');
  });
});
