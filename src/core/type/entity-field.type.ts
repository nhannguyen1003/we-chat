export type EntityField = {
  name: string
  label: string
  type: "string" | "number" | "boolean" | "date" | "enum"
  enumValues?: string[]
  operators: CriteriaOperator[]
}

export type EntityTypeFields = {
  [key in ApprovalEntityType]: EntityField[]
}

export enum CriteriaOperator {
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  GREATER_THAN_EQUALS = "GREATER_THAN_EQUALS",
  LESS_THAN_EQUALS = "LESS_THAN_EQUALS",
  CONTAINS = "CONTAINS",
  NOT_CONTAINS = "NOT_CONTAINS",
  IN = "IN",
  NOT_IN = "NOT_IN"
}

export enum ApprovalEntityType {
  REQUEST_TYPE = "REQUEST_TYPE",
  LEAVE_TYPE = "LEAVE_TYPE",
  POLICY = "POLICY",
  EVENT = "EVENT",
  NEWS = "NEWS"
}
