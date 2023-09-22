import {Request, Response} from "express"
import UserService from "../service/UserService";
import {AuthenticatedRequest} from "../type";
import {User} from "../entity/User";
import {UserDTO} from "../dto/UserDTO";
import {AppRole} from "../enum";
import * as bcrypt from 'bcrypt';

class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const params = req.query;
      const users = await this.userService.findAllUsers(params);
      return res.status(200).json({
        message: 'Get all users success',
        data: users
      });
    } catch (err: any) {
      return res.status(500).json({
        message: 'Get all users failed ' + err.message
      })
    }
  }

  async me(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      const inDbUser = await this.userService.findUserById(user.id, true);
      if (!inDbUser) {
        return res.status(400).json({
          message: 'User not found'
        })
      }
      return res.status(200).json({
        message: 'Get user success',
        data: new UserDTO(inDbUser)
      });
    } catch (err: any) {
      return res.status(500).json({
        message: 'Get user failed ' + err.message
      })
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      const {age, phone, email, name, avatar} = req.body;
      const inDbUser = await this.userService.findUserById(user.id);
      if (!inDbUser) {
        return res.status(400).json({
          message: 'User not found'
        })
      }
      if (age) inDbUser.age = age;
      if (phone) inDbUser.phone = phone;
      if (email) inDbUser.email = email;
      if (name) inDbUser.name = name;

      if (avatar) inDbUser.avatar = avatar;
      const updatedUser = await this.userService.updateUser(inDbUser);
      return res.status(200).json({
        message: 'Update profile success',
        data: new UserDTO(updatedUser)
      });
    } catch (err: any) {
      return res.status(500).json({
        message: 'Update profile failed ' + err.message
      })
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const {age, phone, email, name, avatar, schoolClassId, schoolId} = req.body;
      const {id} = req.params;
      const inDbUser = await this.userService.findUserById(+id);
      if (!inDbUser) {
        return res.status(400).json({
          message: 'User not found'
        })
      }
      if (age) inDbUser.age = age;
      if (phone) inDbUser.phone = phone;
      if (email) inDbUser.email = email;
      if (name) inDbUser.name = name;
      if (avatar) inDbUser.avatar = avatar;
      if (schoolClassId) inDbUser.schoolClassId = schoolClassId;
      if (schoolId) inDbUser.schoolId = schoolId;
      const updatedUser = await this.userService.updateUser(inDbUser);
      return res.status(200).json({
        message: 'Update user success',
        data: new UserDTO(updatedUser)
      });
    } catch (err: any) {
      console.log("update user error", err);
      return res.status(500).json({
        message: 'Update user failed ' + err.message
      });
    }
  }

  //a class monitor can register students to his class
  async registerStudents(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      const students = req.body;
      if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
          message: 'Invalid students'
        })
      }
      const classMonitor = await this.userService.findUserById(user.id);
      if (!classMonitor) {
        return res.status(400).json({
          message: 'User not found'
        })
      }
      //validate students array
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        if (!student.studentId || !student.name || !student.phone || !student.email) {
          return res.status(400).json({
            message: `Student at index ${i} is invalid: studentId, name, phone, email are required`
          })
        }
      }

      if (!classMonitor.schoolClassId) {
        return res.status(400).json({
          message: 'User not join any class'
        })
      }
      if (!classMonitor.schoolId || !classMonitor.schoolClassId) {
        return res.status(400).json({
          message: 'User not join any class'
        })
      }
      const listToCreate = [];
      for (const student of students) {
        const toRegisterStudent = new User();
        toRegisterStudent.studentId = student.studentId;
        toRegisterStudent.name = student.name;
        toRegisterStudent.phone = student.phone;
        toRegisterStudent.email = student.email;
        toRegisterStudent.schoolClassId = classMonitor.schoolClassId;
        toRegisterStudent.schoolId = classMonitor.schoolId;
        toRegisterStudent.role = AppRole.USER;
        const defaultPwd = '123456';
        //hash password
        const salt = await bcrypt.genSalt(10)
        const hashPwd = await bcrypt.hash(defaultPwd, salt)
        toRegisterStudent.password = hashPwd;
        listToCreate.push(toRegisterStudent);
      }
      const usersCreated = await this.userService.createUsers(listToCreate);

      return res.status(200).json({
        message: 'Register students success',
        data: usersCreated.map((u: User) => new UserDTO(u))
      });
    } catch (err: any) {
      return res.status(500).json({
        message: 'Register students failed ' + err.message
      })
    }
  }

  async getUserDetail(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id;
      const user = await this.userService.findUserById(+id, true);
      if (!user) {
        return res.status(400).json({
          message: 'User not found'
        })
      }
      return res.status(200).json({
        message: 'Get user detail success',
        data: new UserDTO(user)
      });

    } catch (err: any) {
      return res.status(500).json({
        message: 'Get user detail failed ' + err.message
      })
    }
  }


}

export default UserController;
