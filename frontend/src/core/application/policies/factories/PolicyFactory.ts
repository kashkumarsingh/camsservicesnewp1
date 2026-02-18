/**
 * Policy Factory
 * 
 * Factory for creating policies.
 */

import { Policy } from '../../../domain/policies/entities/Policy';
import { PolicySlug } from '../../../domain/policies/valueObjects/PolicySlug';
import { CreatePolicyDTO } from '../dto/CreatePolicyDTO';
import { IIdGenerator } from '../../faq/ports/IIdGenerator';

export class PolicyFactory {
  constructor(private readonly idGenerator: IIdGenerator) {}

  create(input: CreatePolicyDTO): Policy {
    // Generate ID
    const id = this.idGenerator.generate();

    // Generate slug from title
    const slug = PolicySlug.fromName(input.title);

    // Create policy with business rules enforced
    return Policy.create(
      id,
      input.title,
      input.type,
      input.content,
      new Date(input.effectiveDate),
      input.version,
      slug,
      input.summary,
      input.published || true
    );
  }
}


