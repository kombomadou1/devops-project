import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationsUserAdd } from './associations-user-add';

describe('AssociationsUserAdd', () => {
  let component: AssociationsUserAdd;
  let fixture: ComponentFixture<AssociationsUserAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationsUserAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociationsUserAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
