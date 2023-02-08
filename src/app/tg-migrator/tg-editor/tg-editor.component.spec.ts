import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TgEditorComponent } from './tg-editor.component';

describe('TgEditorComponent', () => {
  let component: TgEditorComponent;
  let fixture: ComponentFixture<TgEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TgEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TgEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
