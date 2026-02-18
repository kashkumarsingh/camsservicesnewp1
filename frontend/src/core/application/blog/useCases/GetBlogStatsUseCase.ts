/**
 * Get Blog Stats Use Case
 * 
 * Orchestrates getting blog statistics.
 */

import { BlogStatsCalculator } from '../../../domain/blog/services/BlogStatsCalculator';
import { IBlogRepository } from '../ports/IBlogRepository';
import { BlogStatsDTO } from '../dto/BlogStatsDTO';

export class GetBlogStatsUseCase {
  constructor(private readonly blogRepository: IBlogRepository) {}

  async execute(): Promise<BlogStatsDTO> {
    // Get all posts
    const posts = await this.blogRepository.findAll();

    // Calculate statistics
    const total = BlogStatsCalculator.calculateTotalPosts(posts);
    const published = BlogStatsCalculator.calculatePublishedPosts(posts);
    const mostViewed = BlogStatsCalculator.findMostViewed(posts);
    const mostRecent = BlogStatsCalculator.findMostRecent(posts);
    const totalViews = BlogStatsCalculator.calculateTotalViews(posts);
    const averageViews = BlogStatsCalculator.calculateAverageViews(posts);
    const averageReadingTime = BlogStatsCalculator.calculateAverageReadingTime(posts);

    return {
      total,
      published,
      mostViewed: mostViewed ? {
        id: mostViewed.id,
        title: mostViewed.title,
        views: mostViewed.views,
      } : undefined,
      mostRecent: mostRecent && mostRecent.publishedAt ? {
        id: mostRecent.id,
        title: mostRecent.title,
        publishedAt: mostRecent.publishedAt.toISOString(),
      } : undefined,
      totalViews,
      averageViews,
      averageReadingTime,
    };
  }
}


