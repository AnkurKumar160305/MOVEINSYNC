import mongoose, { Schema, Document } from 'mongoose';

export interface IExperiment extends Document {
  experimentId: string;
  title: string;
  hypothesis: string;
  linkedIssueIds: string[];
  problemCategory: string;
  targetUsers: string;
  startDate: Date | null;
  endDate: Date | null;
  baselineMetrics: Record<string, number>;
  targetMetrics: Record<string, number>;
  observedMetrics: Record<string, number>;
  guardrailMetrics: Record<string, number>;
  rolloutPercentage: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  result: 'pending' | 'positive' | 'neutral' | 'negative';
  interpretation: string;
  limitations: string[];
  successCriteria: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExperimentSchema = new Schema<IExperiment>(
  {
    experimentId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    hypothesis: { type: String, default: '' },
    linkedIssueIds: [{ type: String }],
    problemCategory: { type: String, default: '' },
    targetUsers: { type: String, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    baselineMetrics: { type: Schema.Types.Mixed, default: {} },
    targetMetrics: { type: Schema.Types.Mixed, default: {} },
    observedMetrics: { type: Schema.Types.Mixed, default: {} },
    guardrailMetrics: { type: Schema.Types.Mixed, default: {} },
    rolloutPercentage: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
      default: 'draft',
    },
    result: {
      type: String,
      enum: ['pending', 'positive', 'neutral', 'negative'],
      default: 'pending',
    },
    interpretation: { type: String, default: '' },
    limitations: [{ type: String }],
    successCriteria: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IExperiment>('Experiment', ExperimentSchema);
