import UserService from "../service/UserService";
import {Request, Response} from "express";
import {User} from "../entity/User";
import * as bcrypt from 'bcrypt';
import 'dotenv/config'
import {UserDTO} from "../dto/UserDTO";

class AuthController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async register(req: Request, res: Response) {
    try {
      const {name, email, password, studentId} = req.body
      if (!name || !email || !password || !studentId) {
        return res.status(400).json({
          message: 'Please fill all fields now12345!'
        })
      }
      const existStudentId = await this.userService.findByStudentId(studentId);
      if(existStudentId) {
        return res.status(400).json({
          message: 'Student id already exist'
        })
      }
      const user = new User();
      user.name = name;
      user.email = email;
      user.studentId = studentId;
      //hash password
      const salt = await bcrypt.genSalt(10)
      const hashPwd = await bcrypt.hash(password, salt)
      user.password = hashPwd;
      const newUser = await this.userService.createUser(user);
      res.status(201).json({
        message: 'Register success',
        data: new UserDTO(newUser)
      });

    } catch (err: any) {
      console.log(err)
      res.status(500).json({
        message: 'Register failed ' + err.message
      })
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const {email, password} = req.body;
      if (!email || !password) {
        return res.status(400).json({
          message: 'Please fill all fields'
        })
      }
      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        return res.status(400).json({
          message: 'Email not found'
        })
      }
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({
          message: 'Invalid password'
        })
      }
      const token = user.generateJwt()
      res.status(200).json({
        message: 'Login success',
        data: {
          accessToken: token,
          user: new UserDTO(user)
        }
      })

    } catch (err: any) {
      res.status(500).json({
        message: 'Login failed ' + err.message
      })
    }
  }
}

export default AuthController;
