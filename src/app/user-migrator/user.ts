import {GenericType} from '../generics/generic-type';
import {PatchableAttr} from '../shared/patching/patchable-attr';
import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export enum UserRole {
  ADMIN = 'admin',
  GUEST = 'guest',
  USER = 'user',
}
export class User extends GenericType{
  name: PatchableAttr = new PatchableAttr();
  initials: PatchableAttr = new PatchableAttr();
  email: PatchableAttr = new PatchableAttr();
  username: PatchableAttr = new PatchableAttr();
  role: PatchableAttr = new PatchableAttr();
  isPrimaryInvestigator: PatchableAttr = new PatchableAttr();
  isResearcher: PatchableAttr = new PatchableAttr();
  isActive: PatchableAttr = new PatchableAttr();

  override get id(): string {
    return this.username.original;
  }

  override get informalName(): string {
    return this.name.current;
  }

  getPatchableAttrValue(attrName: string): string | null {
    if (this[attrName as keyof User] && this[attrName as keyof User] instanceof PatchableAttr) {
      return (this[attrName as keyof User] as PatchableAttr).current;
    }  else {
      return null;
    }
  }
}

export function ValidateUserRoleFC(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return ValidateUserRole(control.value);
  }
}
export function ValidateUserRole(proposedRole: string = ''): ValidationErrors | null {
  if ((Object.values(UserRole) as string[]).includes(proposedRole.toLowerCase())) {
    return null;
  } else {
    return {'invalid': Object.values(UserRole).join(' | ')};
  }
}

