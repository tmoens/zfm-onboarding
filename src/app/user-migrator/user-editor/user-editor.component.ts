import {Component, Input, OnInit} from '@angular/core';
import {User, ValidateUserRoleFC} from '../user';
import {UserService} from '../user.service';
import {ValidatorFn, Validators} from '@angular/forms';
import {ValidateYesNoFC} from '../../generics/validators/yes-no.validator';
import {uniquenessValidatorFC} from '../../generics/validators/uniqueness.validator';

@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
})
export class UserEditorComponent implements OnInit {
  private _user: User | null = null;

  public mode: 'edit' | 'add' = 'edit';

  @Input() set user(user: User | null) {
    if (user) {
      this._user = user;
      if (user.name.original === '') {
        this.mode = 'add';
      } else {
        this.mode = 'edit'
      }
      this.nameValidators = [Validators.required, uniquenessValidatorFC(this.service, this.user, 'name')]
      this.usernameValidators = [Validators.required, uniquenessValidatorFC(this.service, this.user, 'username')]
      this.initialsValidators = [Validators.required, uniquenessValidatorFC(this.service, this.user, 'initials')]
    }
  };
  get user(): User | null  {
    return this._user;
  }

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
    protected service: UserService,
  ) {
  }

  ngOnInit(): void {
  }

  onSave() {
    if (this.user) {
      this.service.addUser();
    }
  }

  onChange(event: string) {
    this.user?.updateValidity();
  }
}
