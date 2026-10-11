import mongoose, { Schema, Document } from 'mongoose';

export interface IImportBatch extends Document {
  batchId: string;
  source: string;
  platform: string;
  filename: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  parseErrors: Array<{ row: number; field: string; message: string }>;
  startedAt: Date;
  completedAt: Date | null;
}

const ImportBatchSchema = new Schema<IImportBatch>(
  {
    batchId: { type: String, required: true, unique: true },
    source: { type: String, default: 'csv_upload' },
    platform: { type: String, default: 'unknown' },
    filename: { type: String, default: '' },
    totalRows: { type: Number, default: 0 },
    validRows: { type: Number, default: 0 },
    invalidRows: { type: Number, default: 0 },
    duplicateRows: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    parseErrors: [
      {
        row: Number,
        field: String,
        message: String,
      },
    ],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IImportBatch>('ImportBatch', ImportBatchSchema);
