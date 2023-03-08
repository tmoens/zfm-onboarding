import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User, ValidateUserRoleFC} from '../user';
import {ResearcherService} from '../researcher.service';
import {ValidatorFn, Validators} from '@angular/forms';
import {ValidateYesNoFC} from '../../generics/validators/yes-no.validator';
import {uniquenessValidatorFC} from '../../generics/validators/uniqueness.validator';

@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
})
export class UserEditorComponent implements OnInit {
  private _user: User | null = null;

  @Input() mode: 'edit' | 'add' = 'edit';

  @Input() set user(user: User | null) {
    if (user) {
      this._user = user;
      this.nameValidators = [Validators.required, uniquenessValidatorFC(this.service, this.user, 'name')]
      this.usernameValidators = [Validators.required, uniquenessValidatorFC(this.service, this.user, 'username')]
      this.initialsValidators = [Validators.required, uniquenessValidatorFC(this.service, this.user, 'initials')]
    }
  };

  get user(): User | null  {
    return this._user;
  }

  @Output()
  onUserCreated: EventEmitter<string> = new EventEmitter<string>();
  nameValidators: ValidatorFn[] = [];
  usernameValidators: ValidatorFn[] = [];
  initialsValidators: ValidatorFn[] = [];
  emailValidators: ValidatorFn[] = [Validators.required, Validators.email];
  requiredValidator: ValidatorFn[] = [Validators.required]
  userRoleValidators: ValidatorFn[] = [Validators.required, ValidateUserRoleFC()];
  yesNoValidators: ValidatorFn[] = [Validators.required, ValidateYesNoFC()];

  // TODO since the username field is used as the "target" of pattern matching,
  // changes to a username should trigger changes to any matching rules that use it as a target.


  constructor(
    private service: ResearcherService,
  ) {
  }

  ngOnInit(): void {
  }

  onSave() {
    if (this.user && this.user.valid) {
      this.onUserCreated.emit('user created');
    }
  }

  onChange(event: string) {
    this.user?.updateValidity();
  }
}
