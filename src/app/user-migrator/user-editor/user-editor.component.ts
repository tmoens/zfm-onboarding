import {Component, Input, OnInit} from '@angular/core';
import {User, UserRole} from '../user';
import {UserService} from '../user.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
})
export class UserEditorComponent implements OnInit {
  public UserRole = UserRole;

  public mode: 'edit' | 'add' = 'edit';

  userForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required]],
    initials: ['', Validators.required],
    role: [UserRole.GUEST],
    isActive: [false],
    isPrimaryInvestigator: [false],
    isResearcher: [false],
  })
  @Input() set user(user: User | null) {
    if (user) {
      this.userForm.setValue(user);
      this.mode = 'edit';
    } else {
      this.userForm.setValue({
        name: '',
        email: '',
        username: '',
        initials: '',
        role: UserRole.GUEST,
        isActive: false,
        isResearcher: false,
        isPrimaryInvestigator: false
      })
      this.mode = 'add';
    }
  }

  constructor(
    private fb: FormBuilder,
    protected service: UserService,
    ) { }

  ngOnInit(): void {
  }

  onSave() {
    if (this.userForm.valid) {
      if (this.mode === 'edit' && this.service.selected) {
        this.service.selected.datafillFromJson(this.userForm.getRawValue());
      } else {
        const newUser = new User;
        newUser.datafillFromJson(this.userForm.getRawValue());
        this.service.add(newUser);
        this.service.select(newUser);
        this.mode = 'edit';
      }
      this.userForm.markAsPristine();
    }
  }
}
