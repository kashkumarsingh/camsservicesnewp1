import FooterClient from './FooterClient';
import { getSiteSettings } from '@/server/siteSettings/getSiteSettings';
import { SiteSettingsMapper } from '@/core/application/siteSettings/mappers/SiteSettingsMapper';

export default async function Footer() {
  const settings = await getSiteSettings().catch(() => null);
  const serializableSettings = settings ? SiteSettingsMapper.toDTO(settings) : null;

  return <FooterClient settings={serializableSettings} />;
}
