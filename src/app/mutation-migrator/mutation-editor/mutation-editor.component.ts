import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Mutation} from '../mutation';
import {ValidatorFn, Validators} from '@angular/forms';
import {uniquenessValidatorFC} from '../../generics/validators/uniqueness.validator';
import {MutationService} from '../mutation.service';

@Component({
  selector: 'app-mutation-editor',
  templateUrl: './mutation-editor.component.html',
})
export class MutationEditorComponent implements OnInit {
  private _mutation: Mutation | null = null;

  @Input() mode: 'edit' | 'add' = 'edit';

  @Input() set mutation(mutation: Mutation | null) {
    if (mutation) {
      this._mutation = mutation;
      this.alleleValidators = [Validators.required, uniquenessValidatorFC(this.service, this._mutation, 'allele')]
    }
  };
  get mutation(): Mutation | null  {
    return this._mutation;
  }

  requiredValidator: ValidatorFn[] = [Validators.required]

  @Output() onMutationCreated: EventEmitter<string> = new EventEmitter<string>();
  alleleValidators: ValidatorFn[] = [];

  constructor(
    private service: MutationService,
  ) { }

  ngOnInit(): void {
  }

  onSave() {
    if (this.mutation && this.mutation.valid) {
      this.onMutationCreated.emit('mutation created');
    }
  }

  onChange(event: string) {
    this.mutation?.updateValidity();
  }
}
