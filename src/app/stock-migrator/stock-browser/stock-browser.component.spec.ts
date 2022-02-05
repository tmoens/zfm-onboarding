import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockBrowserComponent } from './stock-browser.component';

describe('StockBrowserComponent', () => {
  let component: StockBrowserComponent;
  let fixture: ComponentFixture<StockBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockBrowserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
