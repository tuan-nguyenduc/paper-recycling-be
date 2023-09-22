import {Request} from "express";
import {User} from "../entity/User";

export type AuthenticatedRequest = Request & { user: User, file?: any };

export type Pagination<T> = {
  perPage: number,
  currentPage: number,
  contents: T[],
  totalPage: number,
  totalElements: number
}
