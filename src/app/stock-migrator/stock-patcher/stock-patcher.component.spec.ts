import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockPatcherComponent } from './stock-patcher.component';

describe('StockPatcherComponent', () => {
  let component: StockPatcherComponent;
  let fixture: ComponentFixture<StockPatcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockPatcherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockPatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
