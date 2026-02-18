/**
 * Activity Factory
 * 
 * Factory for creating activities.
 */

import { Activity } from '../../../domain/activities/entities/Activity';
import { ActivitySlug } from '../../../domain/activities/valueObjects/ActivitySlug';
import { CreateActivityDTO } from '../dto/CreateActivityDTO';
import { IIdGenerator } from '../../faq/ports/IIdGenerator';

export class ActivityFactory {
  constructor(private readonly idGenerator: IIdGenerator) {}

  create(input: CreateActivityDTO): Activity {
    // Generate ID
    const id = this.idGenerator.generate();

    // Generate slug from name
    const slug = ActivitySlug.fromName(input.name);

    // Create activity with business rules enforced
    return Activity.create(
      id,
      input.name,
      input.description,
      input.imageUrl,
      input.duration,
      input.trainerIds,
      slug,
      input.category,
      input.ageRange,
      input.trainers,
      input.published || true
    );
  }
}


