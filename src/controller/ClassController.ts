import ClassService from "../service/ClassService";
import {AuthenticatedRequest} from "../type";
import {Response} from "express";
import SchoolClass from "../entity/SchoolClass";
import {AppDataSource} from "../data-source";
import {AppRole, PaperPointHistoryType} from "../enum";
import UserService from "../service/UserService";
import PaperPointHistory from "../entity/PaperPointHistory";
import PaperPointHistoryService from "../service/PaperPointHistoryService";

class ClassController {
  private readonly classService: ClassService;
  private readonly userService: UserService;
  private static _queryRunner: any = null;
  private readonly paperPointHistoryService: PaperPointHistoryService

  constructor() {
    this.classService = new ClassService();
    this.userService = new UserService();
    this.paperPointHistoryService = new PaperPointHistoryService();
  }

  async getAllClass(req: AuthenticatedRequest, res: Response) {
    try {
      const {page = 0, limit = 10, schoolId, q} = req.query;
      const data = await this.classService.findAllClass(+page, +limit, {
        schoolId: schoolId ? +schoolId : undefined,
        q: q ? q : undefined
      })
      return res.status(200).json({
        message: "Get all class success",
        data
      });
    } catch (err: any) {
      console.log("Get all class failed: ", err);
      return res.status(500).json({
        message: "Get all class failed: " + err.message
      });
    }
  }

  async getClassById(req: AuthenticatedRequest, res: Response) {
    try {
      const clazz = await this.classService.findClassById(+req.params.id);
      if (!clazz) {
        return res.status(404).json({
          message: "Class not found"
        });
      }
      return res.status(200).json({
        message: "Get class by id success",
        data: clazz
      });

    } catch (err: any) {
      console.log("Get class by id failed: ", err);
      return res.status(500).json({
        message: "Get class by id failed: " + err.message
      });
    }
  }

  async createClass(req: AuthenticatedRequest, res: Response) {
    try {
      const {name, grade, teacherId, totalStudent, nextClassId, schoolId} = req.body;

      if (!name || !grade || !schoolId) {
        return res.status(400).json({
          message: "name, grade, schoolId are required"
        });
      }
      if (nextClassId) {
        const nextClass = await this.classService.findClassById(nextClassId);
        if (!nextClass) {
          return res.status(400).json({
            message: "nextClassId is invalid"
          });
        }
      }
      const clazz = new SchoolClass();
      clazz.name = name;
      clazz.grade = grade;
      clazz.teacherId = teacherId;
      clazz.totalStudent = totalStudent;
      clazz.nextClassId = nextClassId;
      clazz.schoolId = schoolId;
      const result = await this.classService.createClass(clazz);
      return res.status(200).json({
        message: "Create class success",
        data: result
      });
    } catch (err: any) {
      console.log("Create class failed: ", err);
      return res.status(500).json({
        message: "Create class failed: " + err.message
      });
    }
  }

  async createClasses(req: AuthenticatedRequest, res: Response) {
    try {
      const classes = req.body;
      //validate
      classes.forEach((clazz: any) => {
        const {name, grade, schoolId, _id} = clazz;
        if (!name || !grade || !schoolId || !_id) {
          throw new Error('name, grade, schoolId are required')
        }
      });
      //create classs then set nextClassId by _id
      const createdClasses = await Promise.all(classes.map(async (clazz: any) => {
        const {name, grade, totalStudent, nextClassId, schoolId} = clazz;
        //create class without nextClassId
        const newClass = new SchoolClass();
        newClass.name = name;
        newClass.grade = grade;
        newClass.totalStudent = totalStudent;
        newClass.schoolId = schoolId;
        const result = await this.classService.createClass(newClass);
        return {
          ...result,
          _id: clazz._id,
          next_id: nextClassId
        }
      }))

      //set nextClassId
      const updatedClasses = await Promise.all(createdClasses.map(async (clazz: any) => {
        const {next_id} = clazz;
        if (next_id) {
          const nextClass = createdClasses.find((c: any) => c._id === next_id);
          if (!nextClass) {
            throw new Error('nextClassId is invalid')
          }
          const result = await this.classService.updateClass({
            ...clazz,
            nextClassId: nextClass.id
          });
          return result;
        }
        return clazz;
      }))
      return res.status(200).json({
        message: "Create classes success",
        data: updatedClasses
      })

    } catch (err: any) {
      console.log("Create classes failed: ", err);
      return res.status(500).json({
        message: "Create classes failed: " + err.message
      });
    }
  }

  async updateClass(req: AuthenticatedRequest, res: Response) {
    try {
      const {id} = req.params;
      const {name, grade, teacherId, totalStudent, nextClassId, schoolId} = req.body;
      const clazz = await this.classService.findClassById(+id);
      if (!clazz) {
        return res.status(404).json({
          message: "Class not found"
        });
      }
      if (name) clazz.name = name;
      if (grade) clazz.grade = grade;
      if (teacherId) clazz.teacherId = teacherId;
      if (totalStudent) clazz.totalStudent = totalStudent;
      if (nextClassId) {
        const nextClass = await this.classService.findClassById(nextClassId);
        if (!nextClass) {
          return res.status(400).json({
            message: "nextClassId is invalid"
          });
        }
        clazz.nextClassId = nextClassId;
      }
      if (schoolId) clazz.schoolId = schoolId;
      const result = await this.classService.updateClass(clazz);
      return res.status(200).json({
        message: "Update class success",
        data: result
      });
    } catch (err: any) {
      console.log("Update class failed: ", err);
      return res.status(500).json({
        message: "Update class failed: " + err.message
      });
    }
  }

  async deleteClass(req: AuthenticatedRequest, res: Response) {
    try {
      const {id} = req.params;
      await this.classService.deleteClass(+id);
      return res.status(200).json({
        message: "Delete class success"
      });
    } catch (err: any) {
      console.log("Delete class failed: ", err);
      return res.status(500).json({
        message: "Delete class failed: " + err.message
      });
    }
  }

  async distributePaperPoint(req: AuthenticatedRequest, res: Response) {
    let queryRunner = ClassController._queryRunner;
    if (!queryRunner) {
      console.log('create query runner');
      ClassController._queryRunner = AppDataSource.createQueryRunner();
      queryRunner = ClassController._queryRunner;
    }
    await queryRunner.startTransaction()
    try {
      const {id} = req.params;
      const rewardList: { userId, paperPoint }[] = req.body;
      const user = req.user;
      if (user.role !== AppRole.ADMIN && +user.schoolClassId !== +id) {
        return res.status(403).json({
          message: "You are not in this class"
        });
      }
      const clazz = await this.classService.findClassById(+id);
      if (!clazz) {
        return res.status(404).json({
          message: "Class not found"
        });
      }
      if (clazz.rewardPaperPoint <= 0) {
        return res.status(400).json({
          message: "This class has no reward paper point"
        });
      }
      if (!Array.isArray(rewardList)) {
        return res.status(400).json({
          message: "Invalid request body"
        });
      }
      if (rewardList.length === 0) {
        return res.status(400).json({
          message: "Reward list is empty"
        });
      }
      //validate reward list
      for (let i = 0; i < rewardList.length; i++) {
        const reward = rewardList[i];
        const {userId, paperPoint} = reward;
        if (!userId || !paperPoint) {
          return res.status(400).json({
            message: `Invalid reward at index ${i}: userId and paperPoint are required`
          });
        }
        if (isNaN(+userId) || isNaN(+paperPoint)) {
          return res.status(400).json({
            message: `Invalid reward at index ${i}: userId and paperPoint must be number`
          });
        }
        if (paperPoint <= 0) {
          return res.status(400).json({
            message: `Invalid reward at index ${i}: paperPoint must be greater than 0`
          });
        }
        const user = await this.userService.findUserById(+userId);
        if (!user) {
          return res.status(400).json({
            message: `Invalid reward at index ${i}: user with id ${userId}not found`
          });
        }
        if (+user.schoolClassId !== +id) {
          return res.status(400).json({
            message: `Invalid reward at index ${i}: user with id ${userId} not in this class`
          });
        }
      }
      //check total paper point
      let totalPaperPoint = 0;
      rewardList.forEach((reward: any) => {
        totalPaperPoint += reward.paperPoint;
      });
      if (totalPaperPoint > clazz.rewardPaperPoint) {
        return res.status(400).json({
          message: `Total paper point is greater than reward paper point`
        });
      }
      //update reward paper point
      clazz.rewardPaperPoint -= totalPaperPoint;
      await ClassController._queryRunner.manager.save(clazz);
      //distribution
      for (let i = 0; i < rewardList.length; i++) {
        const reward = rewardList[i];
        const user = await this.userService.findUserById(+reward.userId);
        user.paperPoint += reward.paperPoint;
        await ClassController._queryRunner.manager.save(user);
        //save history
        const paperPointHistory = new PaperPointHistory();
        paperPointHistory.userId = user.id;
        paperPointHistory.isAdd = true;
        paperPointHistory.referenceId = clazz.id;
        paperPointHistory.amount = reward.paperPoint;
        paperPointHistory.type = PaperPointHistoryType.REWARD
        await ClassController._queryRunner.manager.save(paperPointHistory);
      }
      await queryRunner.commitTransaction();
      return res.status(200).json({
        message: "Distribute paper point success"
      });
    } catch (err: any) {
      console.log("Distribute paper pool failed: ", err);
      await queryRunner.rollbackTransaction();
      return res.status(500).json({
        message: "Distribute paper pool failed: " + err.message
      });
    } finally {
      await queryRunner.release();
      ClassController._queryRunner = null;
      console.log('release query runner')
    }
  }
}

export default ClassController;
