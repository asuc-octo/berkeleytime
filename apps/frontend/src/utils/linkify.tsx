import { ReactNode } from "react";

/**
 * Regular expression to match URLs in text.
 * Matches http://, https://, and www. URLs
 */
const URL_REGEX =
  /(\bhttps?:\/\/[^\s<>()[\]]+|www\.[^\s<>()[\]]+\.[^\s<>()[\]]+)/gi;

/**
 * Converts text containing URLs into React elements with clickable links.
 * URLs are rendered as anchor tags with target="_blank" and rel="noopener noreferrer".
 *
 * @param text - The text to process
 * @param linkClassName - Optional CSS class name to apply to the anchor tags
 * @returns Array of React nodes (strings and anchor elements)
 */
export function linkify(text: string, linkClassName?: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  // Find all URL matches
  const matches = Array.from(text.matchAll(URL_REGEX));

  matches.forEach((match, idx) => {
    let url = match[0];
    const startIndex = match.index!;

    // Remove trailing punctuation that's not part of the URL
    const trailingPunctuationMatch = url.match(/[.,;:!?)\]]+$/);
    let trailingPunctuation = "";

    if (trailingPunctuationMatch) {
      trailingPunctuation = trailingPunctuationMatch[0];
      url = url.slice(0, -trailingPunctuation.length);
    }

    // Add text before the URL
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    // Determine the href (add https:// if it starts with www.)
    const href = url.startsWith("www.") ? `https://${url}` : url;

    // Add the link
    parts.push(
      <a
        key={`link-${idx}-${startIndex}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {url}
      </a>
    );

    // Add the trailing punctuation as regular text
    if (trailingPunctuation) {
      parts.push(trailingPunctuation);
    }

    lastIndex = startIndex + match[0].length;
  });

  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
