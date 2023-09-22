import {NextFunction, Response} from "express";
import * as jwt from "jsonwebtoken";
import 'dotenv/config';
import {AuthenticatedRequest} from "../type";
import {AppRole} from "../enum";
import UserService from "../service/UserService";


const roleMiddleware = (roles: AppRole[] = []) => {
  const userService = new UserService();
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.headers.authorization) {
        return res.status(401).json({
          message: 'Auth failed: please provide token'
        });
      }
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      const user = await userService.findUserById(userId)
      if (!user) {
        return res.status(401).json({
          message: 'Auth failed: invalid user'
        });
      }
      //skip for admin role
      if (user.role === AppRole.ADMIN) {
        req.user = user;
        return next();
      }
      //check role
      if (roles.length && !roles.includes(user.role)) {
        return res.status(401).json({
          message: 'Auth failed: invalid role'
        });
      }
      req.user = user;
      next();
    } catch (err: any) {
      return res.status(401).json({
        message: 'Auth failed: invalid token'
      });
    }
  }
}

export default roleMiddleware;
