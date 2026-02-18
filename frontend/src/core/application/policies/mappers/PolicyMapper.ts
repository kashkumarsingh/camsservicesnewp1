/**
 * Policy Mapper
 * 
 * Converts domain entities ↔ DTOs.
 */

import { Policy } from '../../../domain/policies/entities/Policy';
import { PolicyDTO } from '../dto/PolicyDTO';

export class PolicyMapper {
  static toDTO(policy: Policy): PolicyDTO {
    return {
      id: policy.id,
      title: policy.title,
      slug: policy.slug.toString(),
      type: policy.type,
      content: policy.content,
      summary: policy.summary,
      lastUpdated: policy.lastUpdated.toISOString(),
      effectiveDate: policy.effectiveDate.toISOString(),
      version: policy.version,
      views: policy.views,
      published: policy.published,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
    };
  }

  static toDTOs(policies: Policy[]): PolicyDTO[] {
    return policies.map(policy => this.toDTO(policy));
  }

  static fromDTO(dto: PolicyDTO): Policy {
    // Note: This is for reconstruction from persisted data
    // For new entities, use PolicyFactory
    const { PolicySlug } = require('@/core/domain/policies/valueObjects/PolicySlug');
    const slug = PolicySlug.fromString(dto.slug);
    
    return Policy.create(
      dto.id,
      dto.title,
      dto.type,
      dto.content,
      new Date(dto.effectiveDate),
      dto.version,
      slug,
      dto.summary,
      dto.published
    );
  }
}


