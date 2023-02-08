import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TgSelectorComponent } from './tg-selector.component';

describe('TgSelectorComponent', () => {
  let component: TgSelectorComponent;
  let fixture: ComponentFixture<TgSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TgSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TgSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
