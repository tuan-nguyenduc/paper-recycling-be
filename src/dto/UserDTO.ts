import {AppRole} from "../enum";
import {User} from "../entity/User";
import School from "../entity/School";
import SchoolClass from "../entity/SchoolClass";

export class UserDTO {

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.paperPoint = user.paperPoint;
    this.studentId = user.studentId;
    this.phone = user.phone;
    this.age = user.age;
    this.avatar = user.avatar;
    this.schoolId = user.schoolId;
    this.schoolClass = user.schoolClass;
  }

  public id: number;
  public name: string;
  public email: string;
  public role: AppRole;
  public createdAt: Date;
  public updatedAt: Date;
  public paperPoint: number;
  public studentId: string;
  public phone: string;
  public age: number;
  public avatar: string;
  public schoolId: number;
  public schoolClass: SchoolClass;
}
