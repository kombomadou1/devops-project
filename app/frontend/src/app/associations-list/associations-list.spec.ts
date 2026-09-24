import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AssociationsList } from './associations-list';

describe('AssociationsList', () => {
  let component: AssociationsList;
  let fixture: ComponentFixture<AssociationsList>;

  const mockHttp = {
    get: vi.fn().mockReturnValue(
      of({
        body: [{ id: 1, name: 'Assoc 1' }],
      }),
    ),
    delete: vi.fn().mockReturnValue(of({ body: {} })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationsList],
      providers: [
        provideRouter([]),
        {
          provide: HttpClient,
          useValue: mockHttp,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssociationsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load list of associations on init', () => {
    expect(component.dataSource).toHaveLength(1);
    expect(component.dataSource[0].name).toBe('Assoc 1');
  });
});
