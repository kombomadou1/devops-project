import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationsFormUpdate } from './associations-form-update';

describe('AssociationsFormUpdate', () => {
  let component: AssociationsFormUpdate;
  let fixture: ComponentFixture<AssociationsFormUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationsFormUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociationsFormUpdate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
