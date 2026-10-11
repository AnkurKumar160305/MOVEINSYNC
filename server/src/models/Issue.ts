import mongoose, { Schema, Document } from 'mongoose';

export interface IIssue extends Document {
  issueId: string;
  title: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequencyScore: number;
  impactScore: number;
  trendScore: number;
  confidenceScore: number;
  priorityScore: number;
  evidenceReviewIds: string[];
  rootCauseHypotheses: string[];
  evidenceGaps: string[];
  recommendedFix: string;
  acceptanceCriteria: string[];
  monitoringMetrics: string[];
  owner: string;
  status: 'open' | 'investigating' | 'confirmed' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    issueId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    frequencyScore: { type: Number, default: 0, min: 0, max: 100 },
    impactScore: { type: Number, default: 0, min: 0, max: 100 },
    trendScore: { type: Number, default: 0, min: 0, max: 100 },
    confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
    priorityScore: { type: Number, default: 0, min: 0, max: 100 },
    evidenceReviewIds: [{ type: String }],
    rootCauseHypotheses: [{ type: String }],
    evidenceGaps: [{ type: String }],
    recommendedFix: { type: String, default: '' },
    acceptanceCriteria: [{ type: String }],
    monitoringMetrics: [{ type: String }],
    owner: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'investigating', 'confirmed', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IIssue>('Issue', IssueSchema);
