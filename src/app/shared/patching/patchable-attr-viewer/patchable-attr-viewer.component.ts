import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PatchableAttr} from '../patchable-attr';
import {UntypedFormControl, ValidatorFn} from '@angular/forms';

@Component({
  selector: 'app-patchable-attr-viewer',
  templateUrl: './patchable-attr-viewer.component.html',
})
export class PatchableAttrViewerComponent implements OnInit {
  private _attr: PatchableAttr | null = null;
  @Input() set attr(attr: PatchableAttr | null) {
    this._attr = attr;
    this.fc.setValue(this.attr?.current);
  }
  get attr(): PatchableAttr | null {
    return this._attr;
  }
  private _disabled: boolean = false;
  @Input() set disabled(disabled: boolean | undefined) {
    if (disabled) {
      this._disabled = true;
      this.fc.disable();
    }
  }
  get disabled() {
    return this._disabled;
  }

  @Input() label!: string;
  fc: UntypedFormControl = new UntypedFormControl();
  @Input() set validators(validators: ValidatorFn[]) {
    this.fc.setValidators(validators);
  }

  @Output()
  onChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
    this.fc.valueChanges.subscribe((value: any) => {
      this.attr?.update(String(value));
      this.attr?.setValidity(this.fc.valid);
      this.onChange.emit('change');
    })
  }

  getValidationErrorMessage(): string | null {
    if (this.fc.errors) {
      return Object.values(this.fc.errors).join("; ")
    } else {
      return null;
    }
  }

  get hintMessage(): string | null {
    if (this.attr?.hasChanged()) {
      if(this.attr?.original) {
        return `originally: ${this.attr.original}`;
      }
      return 'originally empty'
    }
    return null;
  }
}
