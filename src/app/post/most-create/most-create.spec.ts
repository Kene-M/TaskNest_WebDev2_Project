import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostCreate } from './most-create';

describe('MostCreate', () => {
  let component: MostCreate;
  let fixture: ComponentFixture<MostCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MostCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MostCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
