/**
 * Blog Validator
 * 
 * Validates blog data according to business rules.
 * Pure validation logic - no processing or formatting.
 */

import { CreateBlogPostDTO, UpdateBlogPostDTO } from '../types/BlogTypes';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class BlogValidator {
  /**
   * Validate blog post creation data
   * @param data - Blog post data to validate
   * @returns Validation result
   */
  static validateCreate(data: CreateBlogPostDTO): ValidationResult {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (!data.excerpt || data.excerpt.trim().length === 0) {
      errors.push('Excerpt is required');
    } else if (data.excerpt.length > 500) {
      errors.push('Excerpt must be less than 500 characters');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (!data.authorId || data.authorId.trim().length === 0) {
      errors.push('Author ID is required');
    }

    if (data.slug && !this.isValidSlug(data.slug)) {
      errors.push('Slug must be a valid URL-friendly string');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate blog post update data
   * @param data - Blog post update data to validate
   * @returns Validation result
   */
  static validateUpdate(data: UpdateBlogPostDTO): ValidationResult {
    const errors: string[] = [];

    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        errors.push('Title cannot be empty');
      } else if (data.title.length > 200) {
        errors.push('Title must be less than 200 characters');
      }
    }

    if (data.excerpt !== undefined) {
      if (data.excerpt.trim().length === 0) {
        errors.push('Excerpt cannot be empty');
      } else if (data.excerpt.length > 500) {
        errors.push('Excerpt must be less than 500 characters');
      }
    }

    if (data.content !== undefined && data.content.trim().length === 0) {
      errors.push('Content cannot be empty');
    }

    if (data.slug && !this.isValidSlug(data.slug)) {
      errors.push('Slug must be a valid URL-friendly string');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate slug format
   * @param slug - Slug to validate
   * @returns True if valid
   */
  private static isValidSlug(slug: string): boolean {
    // Slug should be lowercase, alphanumeric with hyphens
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  }
}

