export const N8N_LINKEDIN_WEBHOOK = 'http://localhost:5678/webhook/1a900821-b2b8-41d5-80c3-0e41752178e9';
export const N8N_FRANCETRAVAIL_WEBHOOK = 'http://localhost:5678/webhook/9da789a5-4890-461c-b6a1-19286c0b2102'
export const N8N_GOOGLEALERTS_WEBHOOK = 'http://localhost:5678/webhook/0486e783-1460-43ba-b5bb-54f979cb3ca7';
export const N8N_COMPANIES_DETAILS_WEBHOOK = 'http://localhost:5678/webhook/enrich-companies-details';
export const N8N_COMPANY_DETAILS_WEBHOOK = 'http://localhost:5678/webhook/enrich-company-details';
export const N8N_CV_MOTIVATION_LETTER_WEBHOOK = 'http://localhost:5678/webhook/cv-motivation-letter';
export const N8N_CV_MOTIVATION_EMAIL_WEBHOOK = 'http://localhost:5678/webhook/cv-motivation-email';
export const N8N_CV_MOTIVATION_EMAIL_DRAFT_WEBHOOK = 'http://localhost:5678/webhook/cv-motivation-email-draft';

export enum N8N_WORKFLOW_NAMES {
  LinkedIn = 'LinkedIn',
  FranceTravail = 'FranceTravail',
  GoogleAlerts = 'GoogleAlerts',
  CompaniesDetails = 'CompaniesDetails',
  CompanyDetails = 'CompanyDetails',
  CVMotivationLetter = 'CVMotivationLetter',
  CVMotivationEmail = 'CVMotivationEmail',
  CVMotivationEmailDraft = 'CVMotivationEmailDraft',
}


type N8NWebhook = {
  name: N8N_WORKFLOW_NAMES;
  url: string;
};
type N8NWebhooks = {
  LinkedIn: N8NWebhook;
  FranceTravail: N8NWebhook;
  GoogleAlerts: N8NWebhook;
  CompaniesDetails: N8NWebhook;
  CompanyDetails: N8NWebhook;
  CVMotivationLetter: N8NWebhook;
  CVMotivationEmail: N8NWebhook;
  CVMotivationEmailDraft: N8NWebhook;
};
export const N8N_WEBHOOKS: N8NWebhooks = {
  LinkedIn: {
    name: N8N_WORKFLOW_NAMES.LinkedIn,
    url: N8N_LINKEDIN_WEBHOOK
  },
  FranceTravail: {
    name: N8N_WORKFLOW_NAMES.FranceTravail,
    url: N8N_FRANCETRAVAIL_WEBHOOK
  },
  GoogleAlerts: {
    name: N8N_WORKFLOW_NAMES.GoogleAlerts,
    url: N8N_GOOGLEALERTS_WEBHOOK
  },
  CompaniesDetails: {
    name: N8N_WORKFLOW_NAMES.CompaniesDetails,
    url: N8N_COMPANIES_DETAILS_WEBHOOK
  },
  CompanyDetails: {
    name: N8N_WORKFLOW_NAMES.CompanyDetails,
    url: N8N_COMPANY_DETAILS_WEBHOOK
  },
  CVMotivationLetter: {
    name: N8N_WORKFLOW_NAMES.CVMotivationLetter,
    url: N8N_CV_MOTIVATION_LETTER_WEBHOOK
  },
  CVMotivationEmail: {
    name: N8N_WORKFLOW_NAMES.CVMotivationEmail,
    url: N8N_CV_MOTIVATION_EMAIL_WEBHOOK
  },
  CVMotivationEmailDraft: {
    name: N8N_WORKFLOW_NAMES.CVMotivationEmailDraft,
    url: N8N_CV_MOTIVATION_EMAIL_DRAFT_WEBHOOK
  }
};