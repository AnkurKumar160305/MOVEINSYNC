import mongoose from 'mongoose';
import config from '../config';
import Review from '../models/Review';
import Issue from '../models/Issue';
import Task from '../models/Task';
import Experiment from '../models/Experiment';
import { generateSeedReviews, generateSeedIssues, generateSeedTasks, generateSeedExperiments } from './seedData';

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo data
    console.log('🧹 Clearing existing demo data...');
    await Review.deleteMany({ isDemo: true });
    await Issue.deleteMany({ issueId: /^ISS-/ });
    await Task.deleteMany({ taskId: /^TASK-/ });
    await Experiment.deleteMany({ experimentId: /^EXP-/ });

    // Seed reviews
    const reviews = generateSeedReviews(250);
    console.log(`📝 Inserting ${reviews.length} demo reviews...`);
    await Review.insertMany(reviews);

    // Seed issues and calculate priority scores
    const issues = generateSeedIssues();
    for (const issue of issues) {
      issue.priorityScore = Math.round(
        issue.frequencyScore * 0.25 +
        issue.impactScore * 0.30 +
        issue.trendScore * 0.20 +
        issue.confidenceScore * 0.15 +
        (issue.severity === 'critical' ? 90 : issue.severity === 'high' ? 70 : issue.severity === 'medium' ? 50 : 30) * 0.10
      );
    }
    console.log(`🐛 Inserting ${issues.length} demo issues...`);
    await Issue.insertMany(issues);

    // Seed tasks
    const tasks = generateSeedTasks();
    console.log(`📋 Inserting ${tasks.length} demo tasks...`);
    await Task.insertMany(tasks);

    // Seed experiments
    const experiments = generateSeedExperiments();
    console.log(`🧪 Inserting ${experiments.length} demo experiments...`);
    await Experiment.insertMany(experiments);

    console.log('');
    console.log('✅ Seed complete!');
    console.log(`   Reviews:     ${reviews.length}`);
    console.log(`   Issues:      ${issues.length}`);
    console.log(`   Tasks:       ${tasks.length}`);
    console.log(`   Experiments: ${experiments.length}`);
    console.log('');
    console.log('⚠️  All seeded data is labeled as demo/illustrative data.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
