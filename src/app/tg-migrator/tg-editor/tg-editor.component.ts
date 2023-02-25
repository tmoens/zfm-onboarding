import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Tg} from '../tg';
import {ValidatorFn, Validators} from '@angular/forms';
import {uniquenessValidatorFC} from '../../generics/validators/uniqueness.validator';
import {TgService} from '../tg.service';

@Component({
  selector: 'app-tg-editor',
  templateUrl: './tg-editor.component.html',
})
export class TgEditorComponent implements OnInit {
  private _tg: Tg | null = null;

  @Input() mode: 'edit' | 'add' = 'edit';

  @Input() set tg(tg: Tg | null) {
    if (tg) {
      this._tg = tg;
      this.alleleValidators = [Validators.required, uniquenessValidatorFC(this.service, this.tg, 'allele')]
    }
  };
  get tg(): Tg | null  {
    return this._tg;
  }

  requiredValidator: ValidatorFn[] = [Validators.required]

  @Output() onTgCreated: EventEmitter<string> = new EventEmitter<string>();
  alleleValidators: ValidatorFn[] = [];

  constructor(
    private service: TgService,
  ) {}

  ngOnInit(): void {
  }

  onSave() {
    if (this.tg && this.tg.valid) {
      this.onTgCreated.emit('tg created');
    }
  }

  onChange(event: string) {
    this.tg?.updateValidity();
  }
}
