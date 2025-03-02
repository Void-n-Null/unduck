/**
 * Bang item interface representing a search shortcut
 */
export interface BangItem {
  t: string;   // bang trigger/shortcut
  s: string;   // service name
  d: string;   // domain
  c?: string;  // category (optional)
  sc?: string; // subcategory (optional)
  r: number;   // relevance score
  u: string;   // url pattern
} 