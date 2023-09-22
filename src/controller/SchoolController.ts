import SchoolService from "../service/SchoolService";
import {AuthenticatedRequest} from "../type";
import {Response} from "express";
import {SchoolStatus, SchoolType} from "../enum";
import School from "../entity/School";

class SchoolController {
  private readonly schoolService: SchoolService;

  constructor() {
    this.schoolService = new SchoolService();
  }

  async findAllSchool(req: AuthenticatedRequest, res: Response) {
    try {
      const {page = 0, limit = 10} = req.query;
      const schools = await this.schoolService.findAllSchool(+page, +limit);
      return res.status(200).json({
        message: "Find all school success",
        data: schools
      });
    } catch (err: any) {
      console.log("Find all school failed: ", err);
      return res.status(500).json({
        message: "Find all school failed: " + err.message
      });
    }
  }

  async findSchoolById(req: AuthenticatedRequest, res: Response) {
    try {
      const {id} = req.params;
      const school = await this.schoolService.findSchoolById(+id, true);
      if (!school) {
        return res.status(404).json({
          message: "School not found"
        });
      }
      return res.status(200).json({
        message: "Find school by id success",
        data: school
      });
    } catch (err: any) {
      console.log("Find school by id failed: ", err);
      return res.status(500).json({
        message: "Find school by id failed: " + err.message
      });
    }
  }

  async createSchool(req: AuthenticatedRequest, res: Response) {
    try {
      const {name, address, phone, principal, type} = req.body;
      if (!name || !type) {
        return res.status(400).json({
          message: "Name and type are required"
        });
      }
      if (type !== SchoolType.HIGH && type !== SchoolType.PRIMARY && type !== SchoolType.JUNIOR) {
        return res.status(400).json({
          message: "Type must be HIGH | PRIMARY | JUNIOR"
        });
      }
      const school = new School();
      school.name = name;
      school.address = address;
      school.phone = phone;
      school.principal = principal;
      school.type = type;
      school.status = SchoolStatus.ACTIVE
      const newSchool = await this.schoolService.createSchool(school);
      return res.status(200).json({
        message: "Create school success",
        data: newSchool
      });
    } catch (err: any) {
      console.log("Create school failed: ", err);
      return res.status(500).json({
        message: "Create school failed: " + err.message
      });
    }
  }

  async updateSchool(req: AuthenticatedRequest, res: Response) {
    try {
      const {id} = req.params;
      const {name, address, phone, principal, type} = req.body;
      if (type && type !== SchoolType.HIGH && type !== SchoolType.PRIMARY && type !== SchoolType.JUNIOR) {
        return res.status(400).json({
          message: "Type must be HIGH | PRIMARY | JUNIOR"
        });
      }
      const school = await this.schoolService.findSchoolById(+id);
      if (!school) {
        return res.status(400).json({
          message: "School not found"
        });
      }
      if (name) school.name = name;
      if (address) school.address = address;
      if (phone) school.phone = phone;
      if (principal) school.principal = principal;
      if (type) school.type = type;
      const updatedSchool = await this.schoolService.updateSchool(school);
      return res.status(200).json({
        message: "Update school success",
        data: updatedSchool
      });
    } catch (err: any) {
      console.log("Update school failed: ", err);
      return res.status(500).json({
        message: "Update school failed: " + err.message
      });
    }
  }

  async deleteSchool(req: AuthenticatedRequest, res: Response) {
    try {
      const {id} = req.params;
      await this.schoolService.deleteSchool(+id);
      return res.status(200).json({
        message: "Delete school success",
      });
    } catch (err: any) {
      console.log("Delete school failed: ", err);
      return res.status(500).json({
        message: "Delete school failed: " + err.message
      });
    }
  }
}

export default SchoolController;
