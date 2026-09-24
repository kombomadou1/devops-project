import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationDetails } from './association-details';

describe('AssociationDetails', () => {
  let component: AssociationDetails;
  let fixture: ComponentFixture<AssociationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociationDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
