import { PageHeader } from '@/components/admin/page-header';
import { SettingsForm } from '@/components/admin/settings-form';
import { getSettings } from '@/lib/queries';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Settings" description="Store details, shipping rates, tax and payment options." />
      <SettingsForm settings={settings} />
    </>
  );
}
