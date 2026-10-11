import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  taskId: string;
  linkedIssueId: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  assignee: string;
  status: 'backlog' | 'ready' | 'in_progress' | 'in_review' | 'released' | 'monitoring' | 'done';
  effort: 'small' | 'medium' | 'large' | 'xlarge';
  acceptanceCriteria: string[];
  testCases: string[];
  releaseVersion: string;
  rollbackPlan: string;
  successMetrics: string[];
  dueDate: Date | null;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  technicalInvestigation: string;
  proposedFix: string;
  observabilityRequirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    taskId: { type: String, required: true, unique: true },
    linkedIssueId: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['P0', 'P1', 'P2', 'P3'],
      default: 'P2',
    },
    assignee: { type: String, default: '' },
    status: {
      type: String,
      enum: ['backlog', 'ready', 'in_progress', 'in_review', 'released', 'monitoring', 'done'],
      default: 'backlog',
    },
    effort: {
      type: String,
      enum: ['small', 'medium', 'large', 'xlarge'],
      default: 'medium',
    },
    acceptanceCriteria: [{ type: String }],
    testCases: [{ type: String }],
    releaseVersion: { type: String, default: '' },
    rollbackPlan: { type: String, default: '' },
    successMetrics: [{ type: String }],
    dueDate: { type: Date, default: null },
    stepsToReproduce: [{ type: String }],
    expectedBehavior: { type: String, default: '' },
    actualBehavior: { type: String, default: '' },
    technicalInvestigation: { type: String, default: '' },
    proposedFix: { type: String, default: '' },
    observabilityRequirements: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
