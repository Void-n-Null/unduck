import { bangs } from "../bang";
import { loadSettings } from "./settings";
import { getCombinedBangs } from "./bangUtils";

// Get combined bangs (default + custom)
const userSettings = loadSettings();
const combinedBangs = getCombinedBangs(userSettings);

// Get default bang from settings module
const defaultBang = combinedBangs.find((b) => b.t === userSettings.defaultBang) || 
  combinedBangs.find((b) => b.t === "g"); // Fallback to Google if not found

/**
 * Array of recursive function jokes
 */
const recursiveJokes = [
  "Why do programmers prefer recursive functions? Because they can solve their own problems without asking for help!",
  "I was going to tell you a recursive joke... but I'd have to tell you a recursive joke first.",
  "How do you understand recursion? First, understand recursion.",
  "What's a recursive programmer's favorite movie? 'Inception', within 'Inception', within 'Inception'...",
  "Recursive function walks into a bar. Recursive function walks into a bar. Recursive function walks into a bar...",
  "To understand recursion: See 'recursion'.",
  "A recursive problem needs a base case. A recursive problem needs a base case. A recursive problem needs... wait, I think I forgot something.",
  "Why did the recursive function go to therapy? It had too many self-references!",
  "Recursive functions are like Russian dolls - it's the same thing just getting smaller and smaller until you find a tiny solid one."
];

/**
 * Get a random joke about recursive functions
 */
function getRandomRecursiveJoke(): string {
  const randomIndex = Math.floor(Math.random() * recursiveJokes.length);
  return recursiveJokes[randomIndex];
}

/**
 * Helper function to extract query parameters even if URL is malformed
 * (handles cases where ? is missing before parameters)
 */
export function getUrlParameters(): URLSearchParams {
  const currentUrl = window.location.href;
  console.log("Raw URL:", currentUrl);
  
  // Check if URL contains parameters without a ? prefix
  if (currentUrl.includes('=') && !currentUrl.includes('?')) {
    // Find where parameters start (after the last /)
    const pathParts = window.location.pathname.split('/');
    const lastPathPart = pathParts[pathParts.length - 1];
    
    if (lastPathPart.includes('=')) {
      console.log("Detected malformed URL, parameters in path:", lastPathPart);
      return new URLSearchParams(lastPathPart);
    }
  }
  
  // Regular case - use search params
  return new URLSearchParams(window.location.search);
}

/**
 * Get the redirect URL based on the bang and query
 */
export function getBangRedirectUrl(): string | null {
  // Use custom function to handle malformed URLs
  const urlParams = getUrlParameters();
  const query = urlParams.get("q") || "";
  
  console.log("getBangRedirectUrl - Query:", query);
  
  if (!query) {
    console.log("No query parameter found");
    return null;
  }

  const match = query.match(/!(\S+)/i);

  const bangCandidate = match?.[1]?.toLowerCase();
  console.log("Bang candidate:", bangCandidate);
  
  // Refresh the combined bangs list to ensure we have the latest custom bangs
  const latestSettings = loadSettings();
  const latestCombinedBangs = getCombinedBangs(latestSettings);
  
  const selectedBang = latestCombinedBangs.find((b) => b.t === bangCandidate) ?? defaultBang;
  console.log("Selected bang:", selectedBang?.t);

  // Remove the first bang from the query
  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();
  console.log("Clean query:", cleanQuery);

  // Format of the url can be either:
  // https://www.google.com/search?q={{{s}}} (original format)
  // https://www.google.com/search?q={searchTerms} (new format for custom bangs)
  const searchUrl = selectedBang?.u.replace(
    /{{{s}}}|{searchTerms}/g,
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/")
  );
  
  console.log("Final search URL:", searchUrl);
  return searchUrl || null;
}

/**
 * Redirect the browser to the appropriate search URL
 */
export function performRedirect(): boolean {
  // Use custom function to handle malformed URLs
  const urlParams = getUrlParameters();
  const isRecursive = urlParams.get("recursive") === "true";
  const query = urlParams.get("q");
  
  console.log("performRedirect - Is Recursive:", isRecursive, "Query:", query);
  
  // If recursive parameter is true, don't redirect
  if (isRecursive) {
    console.log("Recursive mode detected - not redirecting");
    return false;
  }
  
  // Only proceed with redirect if not in recursive mode
  const searchUrl = getBangRedirectUrl();
  console.log("Redirect URL:", searchUrl);
  
  if (!searchUrl) {
    console.log("No search URL - not redirecting");
    return false;
  }
  
  console.log("Redirecting to:", searchUrl);
  window.location.replace(searchUrl);
  return true;
} 