/**  Written with the help of AI **/
export default function convertMarkdownToWidgets(markdownText) {
  const results = [];

  // Split the markdown text into an array of lines
  const markdownLines = markdownText.split('\n');

  // Iterate over each line
  markdownLines.forEach((line) => {
    // Log the current line
    const bulletListRegex = /^[-*+] (.*)/;
    const match = line.match(bulletListRegex);
    // If the line matches a bullet list item format, replace with
    // a decorated text with a specific icon
    if (match) {
      const bulletListItemText = match[0].slice(2);

      results.push({
        decoratedText: {
          text: markdownToSimpleHtml(bulletListItemText),
          startIcon: {
            knownIcon: 'STAR',
          },
          wrapText: true,
        },
      });
    } else {
      // Otherwise, convert markdown text to the supported HTML tags
      // in the paragraph widget
      results.push({
        textParagraph: {
          text: markdownToSimpleHtml(line),
        },
      });
    }
  });

  return results;
}

/**  THIS IS WRITTEN WITH HELP OF BARD */
function markdownToSimpleHtml(markdown) {
  const regexes = [
    // Bold
    {
      pattern: /\*\*([^\*\*]+)\*\*/g,
      replacement: '<b>$1</b>',
    },
    // Italics
    {
      pattern: /_([^_]+)_/g,
      replacement: '<i>$1</i>',
    },
    // Underlined
    {
      pattern: /__([^_]+)__/g,
      replacement: '<u>$1</u>',
    },
    // Strikethrough
    {
      pattern: /~~([^~]+)~~/g,
      replacement: '<s>$1</s>',
    },
    // Newline
    {
      pattern: /\r\n/g,
      replacement: '<br>',
    },
    // Links
    {
      pattern: /\[(([^\]]+))\]\((([^)]+))\)/g,
      replacement: '<a href="$2">$1</a>',
    },
    // Newline
    {
      pattern: /\n/g,
      replacement: '<br>',
    },
    // Newline
    {
      pattern: /\r/g,
      replacement: '<br>',
    },
    // Tab
    {
      pattern: /\t/g,
      replacement: '    ',
    },
  ];

  for (const regex of regexes) {
    markdown = markdown.replace(regex.pattern, regex.replacement);
  }

  return markdown;
}