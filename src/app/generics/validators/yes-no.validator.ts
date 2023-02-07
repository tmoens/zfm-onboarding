import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function ValidateYesNoFC(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return ValidateYesNo(control.value);
  }
}

export function ValidateYesNo(proposedRole: string = ''): ValidationErrors | null {
  if (['yes', 'no'].includes(proposedRole.toLowerCase())) {
    return null;
  } else {
    return {'invalid': 'yes | no'};
  }
}
