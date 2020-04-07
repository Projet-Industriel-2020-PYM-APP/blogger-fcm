export interface Blog {
  kind?: string;
  id?: string;
  name?: string;
  description?: string;
  published?: Date;
  updated?: Date;
  url?: string;
  selfLink?: string;
  posts?: Summary;
  pages?: Summary;
  locale?: Locale;
}

export interface Locale {
  language?: string;
  country?: string;
  variant?: string;
}

export interface Summary {
  totalItems?: number;
  selfLink?: string;
}
