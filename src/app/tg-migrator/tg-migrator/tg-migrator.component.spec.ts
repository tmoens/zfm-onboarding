import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TgMigratorComponent } from './tg-migrator.component';

describe('TgMigratorComponent', () => {
  let component: TgMigratorComponent;
  let fixture: ComponentFixture<TgMigratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TgMigratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TgMigratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
