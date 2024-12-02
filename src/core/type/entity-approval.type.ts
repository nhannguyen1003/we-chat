export interface EntityApprovalHandler {
  handleNoApprovalRequired(entityId: number): Promise<void>
  handleApprovalInitiated(entityId: number): Promise<void>
  handleApprovalCompleted(entityId: number): Promise<void>
  handleApprovalRejected(entityId: number, reason?: string): Promise<void>
}
