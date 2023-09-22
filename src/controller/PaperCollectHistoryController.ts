import PaperCollectHistoryService from "../service/PaperCollectHistoryService";
import {AuthenticatedRequest} from "../type";
import {Response} from "express";
import PaperCollectHistory from "../entity/PaperCollectHistory";
import {PaperCollectStatus} from "../enum";
import ClassService from "../service/ClassService";
import {fromWeightToPaperPoint} from "../util";

class PaperCollectHistoryController {
  private readonly paperCollectHistoryService: PaperCollectHistoryService;
  private readonly schoolClassService: ClassService;

  constructor() {
    this.paperCollectHistoryService = new PaperCollectHistoryService();
    this.schoolClassService = new ClassService();
  }

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const {weight, schoolClassId} = req.body;
      if (!weight || !schoolClassId) {
        throw new Error('weight and schoolClassId are required');
      }
      if (isNaN(+weight) || isNaN(+schoolClassId)) {
        throw new Error('weight and schoolClassId must be number');
      }
      const clazz = await this.schoolClassService.findClassById(+schoolClassId);
      if(!clazz) {
        throw new Error('school class not found');
      }
      if(+weight <= 0) {
        throw new Error('weight must be greater than 0');
      }
      const paperCollectHistory = new PaperCollectHistory();
      paperCollectHistory.weight = +weight;
      paperCollectHistory.schoolClassId = +schoolClassId;
      const created = await this.paperCollectHistoryService.create(paperCollectHistory);
      return res.status(201).json({
        message: 'created',
        data: created
      })
    } catch (err: any) {
      console.log("create paper collect history error", err);
      return res.status(500).json({
        message: err.message
      })
    }
  }

  async findAllPaginated(req: AuthenticatedRequest, res: Response) {
    try {
      const params = req.query;
      const pagination = await this.paperCollectHistoryService.findAllPaginated(params);
      return res.status(200).json({
        message: 'success',
        data: pagination
      });
    } catch (err: any) {
      console.log("find all paper collect history error", err);
      return res.status(500).json({
        message: err.message
      })
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const {id} = req.params;
      const {weight, schoolClassId} = req.body;
      const paperCollectHistory = await this.paperCollectHistoryService.findById(+id);
      if (!paperCollectHistory) {
        throw new Error('paper collect history not found');
      }
      if (paperCollectHistory.status !== PaperCollectStatus.CREATED) {
        throw new Error('cannot update this paper collect history');
      }

      if (weight) {
        paperCollectHistory.weight = +weight;
      }
      if (schoolClassId) {
        paperCollectHistory.schoolClassId = +schoolClassId;
      }
      const updated = await this.paperCollectHistoryService.create(paperCollectHistory);
      return res.status(200).json({
        message: 'updated',
        data: updated
      })

    } catch (err: any) {
      console.log("update paper collect history error", err);
      return res.status(500).json({
        message: err.message
      })
    }
  }

  async confirm(req: AuthenticatedRequest, res: Response) {
    try {
      const {id} = req.params;
      const paperCollectHistory = await this.paperCollectHistoryService.findById(+id);
      if (!paperCollectHistory) {
        throw new Error('paper collect history not found');
      }
      if (paperCollectHistory.status !== PaperCollectStatus.CREATED) {
        throw new Error('cannot confirm this paper collect history');
      }
      //transfer money to class
      const classId = paperCollectHistory.schoolClassId;
      const schoolClass = await this.schoolClassService.findClassById(+classId);
      if (!schoolClass) {
        throw new Error('school class not found');
      }
      const rewardPaperPoint = fromWeightToPaperPoint(paperCollectHistory.weight);
      schoolClass.rewardPaperPoint = +schoolClass.rewardPaperPoint + rewardPaperPoint;
      await this.schoolClassService.updateClass(schoolClass);
      //update paper collect history
      paperCollectHistory.status = PaperCollectStatus.COMPLETED;
      paperCollectHistory.paperPointReward = rewardPaperPoint;
      const updated = await this.paperCollectHistoryService.create(paperCollectHistory);

      return res.status(200).json({
        message: 'updated',
        data: updated
      });
      // const schoolClass
    } catch (err: any) {
      console.log("confirm paper collect history error", err);
      return res.status(500).json({
        message: err.message
      })
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response) {
    try {
      const {id} = req.params;
      const paperCollectHistory = await this.paperCollectHistoryService.findById(+id);
      if (!paperCollectHistory) {
        throw new Error('paper collect history not found');
      }
      if (paperCollectHistory.status !== PaperCollectStatus.CREATED) {
        throw new Error('cannot cancel this paper collect history');
      }
      paperCollectHistory.status = PaperCollectStatus.CANCELLED;
      const updated = await this.paperCollectHistoryService.create(paperCollectHistory);
      return res.status(200).json({
        message: 'updated',
        data: updated
      });

    } catch (err: any) {
      console.log("cancel paper collect history error", err);
      return res.status(500).json({
        message: err.message
      })
    }
  }
}

export default PaperCollectHistoryController;
