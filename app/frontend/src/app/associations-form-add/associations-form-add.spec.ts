import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AssociationsFormAdd } from './associations-form-add';

describe('AssociationsFormAdd', () => {
  let component: AssociationsFormAdd;
  let fixture: ComponentFixture<AssociationsFormAdd>;

  const mockHttp = {
    post: vi.fn().mockReturnValue(of({ body: {} })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationsFormAdd],
      providers: [
        provideRouter([]),
        {
          provide: HttpClient,
          useValue: mockHttp,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssociationsFormAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
