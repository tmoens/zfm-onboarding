import {UserJson} from './user-json';
import {GenericType} from '../genericType';

export enum UserRole {
  ADMIN = 'admin',
  GUEST = 'guest',
  RESEARCHER = 'researcher',
}
export class User extends GenericType{
  name = '';
  initials = '';
  email?: string;
  username = '';
  role = UserRole.GUEST;
  isPrimaryInvestigator = false;
  isResearcher = false;
  isActive = false;
  override datafillFromJson(o: any) {
    if (o.name.trim()) this.name = o.name.trim();
    if (o.email.trim()) this.email = o.email.trim();
    if (o.role.trim()) this.role = o.role.trim() as UserRole;
    if (o.username.trim()) this.username = o.username.trim();
    if (o.initials.trim()) this.initials = o.initials.trim();
    this.isActive = (o.isActive && o.isActive === true);
    this.isResearcher = (o.isResearcher && o.isResearcher === true);
    this.isPrimaryInvestigator = (o.isPrimaryInvestigator && o.isPrimaryInvestigator === true);
  }

  override isValid(): boolean {
    return true;
  }
}
