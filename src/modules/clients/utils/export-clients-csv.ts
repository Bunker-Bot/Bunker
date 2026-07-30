import { type FormattedClient } from '../../../lib/services/client.service';

export const exportClientsToCSV = (clients: FormattedClient[]) => {
  if (!clients || clients.length === 0) return;

  const headers = [
    'ID',
    'Name',
    'Company',
    'Email',
    'Phone',
    'Country',
    'Timezone',
    'Website',
    'GitHub',
    'Active Projects',
    'Total Projects',
    'Health Status',
    'Created At',
  ];

  const rows = clients.map((c) => [
    `"${c.id}"`,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${(c.company || '').replace(/"/g, '""')}"`,
    `"${(c.email || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.country || '').replace(/"/g, '""')}"`,
    `"${(c.timezone || '').replace(/"/g, '""')}"`,
    `"${(c.website || '').replace(/"/g, '""')}"`,
    `"${(c.githubUsername || '').replace(/"/g, '""')}"`,
    c.activeProjectsCount,
    c.projectCount,
    `"${c.healthStatus}"`,
    `"${c.formattedCreatedAt}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `bunker_client_directory_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
