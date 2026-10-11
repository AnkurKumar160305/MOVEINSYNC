import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { ClassificationService } from '../src/services';

describe('MoveInSync Pulse Backend API', () => {
  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('mode');
  });

  it('GET /api/dashboard/summary should return computed KPIs', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('averageRating');
    expect(res.body.data).toHaveProperty('totalReviews');
    expect(res.body.data).toHaveProperty('negativePercentage');
    expect(res.body.data).toHaveProperty('bookingComplaintShare');
  });

  it('GET /api/reviews should return paginated reviews', async () => {
    const res = await request(app).get('/api/reviews?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reviews.length).toBeLessThanOrEqual(5);
    expect(res.body.data.pagination).toHaveProperty('total');
  });

  it('GET /api/issues should return prioritized issue list', async () => {
    const res = await request(app).get('/api/issues');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('priorityScore');
  });

  it('GET /api/tasks should return engineering tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/insights/ask should answer grounded questions', async () => {
    const res = await request(app)
      .post('/api/insights/ask')
      .send({ question: 'What are the top causes of negative reviews?' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('answer');
    expect(res.body.data.relevantReviews).toBeDefined();
  });
});

describe('ClassificationService Unit Tests', () => {
  it('should classify booking failure review properly', () => {
    const text = 'Tried to book my ride for morning shift but booking failed repeatedly.';
    const res = ClassificationService.classifyReview(text, 1);
    expect(res.sentiment).toBe('negative');
    expect(res.primaryCategory).toBe('booking');
  });

  it('should classify GPS staleness review properly', () => {
    const text = 'GPS location is completely wrong and ETA jumped from 5 min to 20 min.';
    const res = ClassificationService.classifyReview(text, 1);
    expect(res.sentiment).toBe('negative');
    expect(res.primaryCategory).toBe('gps_eta');
  });

  it('should classify positive praise review properly', () => {
    const text = 'Smooth booking and on time pickup. Great experience!';
    const res = ClassificationService.classifyReview(text, 5);
    expect(res.sentiment).toBe('positive');
  });
});
