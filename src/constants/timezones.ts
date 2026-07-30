export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const TIMEZONES: TimezoneOption[] = [
  { value: 'UTC', label: 'UTC', offset: '(GMT+00:00)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)', offset: '(GMT+05:30)' },
  { value: 'America/New_York', label: 'America/New_York (EST)', offset: '(GMT-05:00)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)', offset: '(GMT-08:00)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST)', offset: '(GMT-06:00)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)', offset: '(GMT+01:00)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)', offset: '(GMT+01:00)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET)', offset: '(GMT+01:00)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)', offset: '(GMT+09:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)', offset: '(GMT+08:00)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)', offset: '(GMT+04:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)', offset: '(GMT+10:00)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST)', offset: '(GMT+12:00)' },
];

export default TIMEZONES;
