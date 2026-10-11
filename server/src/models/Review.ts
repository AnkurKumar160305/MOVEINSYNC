import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  reviewId: string;
  reviewText: string;
  rating: number;
  reviewDate: Date;
  platform: 'google_play' | 'app_store' | 'unknown';
  appVersion: string;
  language: string;
  sourceUrl: string;
  developerResponse: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  primaryCategory: string;
  secondaryCategories: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  aiSummary: string;
  rootCauseHypotheses: string[];
  recommendedActions: string[];
  manualClassification: {
    sentiment?: string;
    primaryCategory?: string;
    severity?: string;
    notes?: string;
    overriddenAt?: Date;
    overriddenBy?: string;
  };
  importBatchId: string;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewId: { type: String, required: true, unique: true, index: true },
    reviewText: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    reviewDate: { type: Date, required: true, index: true },
    platform: {
      type: String,
      enum: ['google_play', 'app_store', 'unknown'],
      default: 'google_play',
      index: true,
    },
    appVersion: { type: String, default: '' },
    language: { type: String, default: 'en' },
    sourceUrl: { type: String, default: '' },
    developerResponse: { type: String, default: '' },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
      index: true,
    },
    primaryCategory: {
      type: String,
      enum: [
        'booking', 'gps_eta', 'notifications', 'pickup_timing',
        'routing', 'check_in_no_show', 'support', 'usability',
        'safety', 'performance', 'general_positive', 'other',
      ],
      default: 'other',
      index: true,
    },
    secondaryCategories: [{ type: String }],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    confidence: { type: Number, default: 0, min: 0, max: 1 },
    aiSummary: { type: String, default: '' },
    rootCauseHypotheses: [{ type: String }],
    recommendedActions: [{ type: String }],
    manualClassification: {
      sentiment: String,
      primaryCategory: String,
      severity: String,
      notes: String,
      overriddenAt: Date,
      overriddenBy: String,
    },
    importBatchId: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ reviewDate: -1, rating: 1 });
ReviewSchema.index({ primaryCategory: 1, severity: 1 });
ReviewSchema.index({ reviewText: 'text' });

export default mongoose.model<IReview>('Review', ReviewSchema);
