import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationsFormAdd } from './associations-form-add';

describe('AssociationsFormAdd', () => {
  let component: AssociationsFormAdd;
  let fixture: ComponentFixture<AssociationsFormAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationsFormAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociationsFormAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
