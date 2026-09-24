import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationsList } from './associations-list';

describe('AssociationsList', () => {
  let component: AssociationsList;
  let fixture: ComponentFixture<AssociationsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociationsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
