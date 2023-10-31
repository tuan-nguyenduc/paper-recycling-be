export enum AppRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  TEACHER = 'TEACHER',
  CLASS_MONITOR = 'CLASS_MONITOR',
}

export enum ProductStatus {
  ACTIVE = 1,
  DEACTIVE = -1,
}

export enum CategoryStatus {
  ACTIVE = 1,
  DELETED = -1,
}


export enum OrderStatus {
  CREATED = 1,
  SHIPPING = 2,
  COMPLETED = 3,
  CANCELLED = -1,
  REFUNDED = -2,
}


export enum PaperPointHistoryType {
  PURCHASE = 'PURCHASE',
  REFUND = 'REFUND',
  CLAIM = 'CLAIM',
  REWARD = 'REWARD',
}

export enum SchoolStatus {
  ACTIVE = 1,
  DELETED = -1,
}

export enum SchoolType {
  PRIMARY = 'PRIMARY', // tiểu học
  JUNIOR = 'JUNIOR', // trung học cơ sở
  HIGH = 'HIGH', // trung học phổ thông
}

export enum ClassStatus {
  ACTIVE = 1,
  DELETED = -1,
}

export enum PaperCollectStatus {
  CREATED = 1,
  COMPLETED = 2,
  CANCELLED = -1,
}

export enum CampaignStatus {
  ONGOING = 1,
  COMPLETED = 2,
  CANCELLED = -1,
  DELETED = 0
}

export enum ExchangeRewardStatus {
  ACTIVE = 1,
  DELETED = -1,
}