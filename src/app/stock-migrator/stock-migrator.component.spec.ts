import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockMigratorComponent } from './stock-migrator.component';

describe('StockMigratorComponent', () => {
  let component: StockMigratorComponent;
  let fixture: ComponentFixture<StockMigratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockMigratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockMigratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
