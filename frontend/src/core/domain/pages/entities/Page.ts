import { BaseEntity } from '../../shared/BaseEntity';
import type {
  PageSectionDTO,
  AboutMissionDTO,
  AboutCoreValueDTO,
  AboutSafeguardingDTO,
} from '../../../application/pages/dto/PageDTO';

export class Page extends BaseEntity {
  private constructor(
    id: string,
    private readonly _title: string,
    private readonly _slug: string,
    private readonly _type: string,
    private readonly _summary: string | undefined,
    private readonly _content: string,
    private readonly _sections: PageSectionDTO[] | undefined,
    private readonly _lastUpdated: Date | undefined,
    private readonly _effectiveDate: Date | undefined,
    private readonly _version: string,
    private readonly _views: number,
    private readonly _published: boolean,
    private readonly _mission: AboutMissionDTO | undefined,
    private readonly _coreValues: AboutCoreValueDTO[] | undefined,
    private readonly _coreValuesSectionTitle: string | undefined,
    private readonly _coreValuesSectionSubtitle: string | undefined,
    private readonly _safeguarding: AboutSafeguardingDTO | undefined,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    title: string;
    slug: string;
    type: string;
    summary?: string;
    content: string;
    sections?: PageSectionDTO[];
    lastUpdated?: Date | string;
    effectiveDate?: Date | string;
    version?: string;
    views?: number;
    published?: boolean;
    mission?: AboutMissionDTO | null;
    coreValues?: AboutCoreValueDTO[] | null;
    coreValuesSectionTitle?: string | null;
    coreValuesSectionSubtitle?: string | null;
    safeguarding?: AboutSafeguardingDTO | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }): Page {
    const {
      id,
      title,
      slug,
      type,
      summary,
      content,
      sections,
      lastUpdated,
      effectiveDate,
      version = '1.0.0',
      views = 0,
      published = true,
      mission,
      coreValues,
      coreValuesSectionTitle,
      coreValuesSectionSubtitle,
      safeguarding,
      createdAt,
      updatedAt,
    } = params;

    const normalizedLastUpdated =
      typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
    const normalizedEffectiveDate =
      typeof effectiveDate === 'string' ? new Date(effectiveDate) : effectiveDate;
    const normalizedCreatedAt =
      typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const normalizedUpdatedAt =
      typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;
    const normalizedSections = sections ? [...sections] : undefined;
    const normalizedMission = mission ?? undefined;
    const normalizedCoreValues = coreValues && coreValues.length > 0 ? [...coreValues] : undefined;
    const normalizedSafeguarding = safeguarding ?? undefined;

    return new Page(
      id,
      title,
      slug,
      type,
      summary,
      content,
      normalizedSections,
      normalizedLastUpdated,
      normalizedEffectiveDate,
      version,
      views,
      published,
      normalizedMission,
      normalizedCoreValues,
      coreValuesSectionTitle ?? undefined,
      coreValuesSectionSubtitle ?? undefined,
      normalizedSafeguarding,
      normalizedCreatedAt,
      normalizedUpdatedAt,
    );
  }

  get title(): string {
    return this._title;
  }

  get slug(): string {
    return this._slug;
  }

  get type(): string {
    return this._type;
  }

  get summary(): string | undefined {
    return this._summary;
  }

  get content(): string {
    return this._content;
  }

  get sections(): PageSectionDTO[] | undefined {
    return this._sections ? [...this._sections] : undefined;
  }

  get lastUpdated(): Date | undefined {
    return this._lastUpdated;
  }

  get effectiveDate(): Date | undefined {
    return this._effectiveDate;
  }

  get version(): string {
    return this._version;
  }

  get views(): number {
    return this._views;
  }

  get published(): boolean {
    return this._published;
  }

  get mission(): AboutMissionDTO | undefined {
    return this._mission;
  }

  get coreValues(): AboutCoreValueDTO[] | undefined {
    return this._coreValues ? [...this._coreValues] : undefined;
  }

  get coreValuesSectionTitle(): string | undefined {
    return this._coreValuesSectionTitle;
  }

  get coreValuesSectionSubtitle(): string | undefined {
    return this._coreValuesSectionSubtitle;
  }

  get safeguarding(): AboutSafeguardingDTO | undefined {
    return this._safeguarding;
  }
}


