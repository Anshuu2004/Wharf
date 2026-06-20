import { RepoContext } from '../services/repo.service';

export function buildReadmePrompt(
  context: RepoContext,
  tone: 'technical' | 'recruiter' | 'beginner',
  sections: string[]
): string {
  const toneInstructions = {
    technical: `Write for developers and contributors. Be precise about implementation, architecture decisions, and technical requirements. Assume the reader is a developer.`,
    recruiter: `Write for hiring managers reviewing a portfolio. Highlight impact, problems solved, and key technical decisions. Use impact-focused language: "Built X that achieves Y using Z." Make it stand out to non-technical recruiters.`,
    beginner: `Write for open-source newcomers. Be welcoming, explain every setup step, use accessible language, and make contributing feel easy and inviting.`
  };

  return `You are Wharf, an AI documentation engine. Generate a highly polished, professional README.md for this repository based on the parsed context.

TONE: ${toneInstructions[tone]}

REPOSITORY CONTEXT:
Name: ${context.meta.name}
Owner: ${context.meta.owner}
Description: ${context.meta.description || 'Not provided'}
Language: ${context.meta.language || 'Not specified'}
Frameworks: ${context.frameworks.join(', ')}
Stars: ${context.meta.stars}
Topics: ${context.meta.topics.join(', ')}
License: ${context.meta.license || 'Not specified'}
Install Commands: Install: ${context.commands.install}, Run: ${context.commands.run}

FILE TREE PREVIEW:
${context.treePreview}

KEY FILES:
${Object.entries(context.keyFiles).map(([file, content]) => `--- File: ${file} ---\n${content.slice(0, 1500)}`).join('\n\n')}

SECTIONS TO INCLUDE: ${sections.join(', ')}

RULES:
- Return ONLY the raw markdown content. Do NOT wrap it in markdown code blocks like \`\`\`markdown ... \`\`\`.
- Start with a descriptive, formatted repository title instead of just the repo name (e.g., "# 🧠 ${context.meta.name}: Project Overview").
- Auto-generate a beautiful badges row at the top using Shields.io. The badges MUST be wrapped in \`<div align="center">\` and \`</div>\`. Use \`${context.meta.owner}\` instead of dummy users for GitHub repo stats.
- Below the badges, add a rich badge row for the author's github profile wrapped in \`<div align="left" style="display: flex; flex-wrap: wrap;">\` containing \`https://github.com/${context.meta.owner}\` links.
- After every section (e.g., Features, Preview, Project Structure), add a \`<br>\` tag to prevent cluttered text.
- If a "Preview" section is included, output it in a tabular format showing image placeholders. Use \`![Placeholder](https://placehold.co/600x400?text=Screenshot+Placeholder)\` for the images.
- If "Technologies Used" or "Tech Stack" is included, display it in a clean markdown table with columns for "Technology" and "Purpose".
- If "System Architecture" is included, ALWAYS include a Mermaid.js diagram (\`\`\`mermaid\`) demonstrating the system logic and architecture.
- For "Project Structure", generate a \`📁 Project Structure\` section containing the EXACT file tree as shown in FILE TREE PREVIEW. Preserve the exact unstructured format. Do NOT sort the files alphabetically. Use \`\`\`bash\` for the tree block and add short inline comments for the files/folders.
- For "Getting Started", use a strict step-by-step numbered format. Add a thin horizontal rule (a single \`#\` or \`---\` line) separating steps like "1. Clone Repository", "2. Setup Backend", "3. Setup Frontend", etc. Use exactly the provided commands: \`${context.commands.install}\` and \`${context.commands.run}\`.
- If "Internal API Services" is requested, list each service and add a thin horizontal rule separating each bullet point.
- For "Contributing", follow a clean layout with "How To Contribute" and "Areas For Contribution" sub-headings.
- For "License", use the user's Github username, \`${context.meta.owner}\`, as the copyright holder.
- For "Credits" and "Author", construct the author sections using \`${context.meta.owner}\` for the github author link and badges, using placeholders for linkedin/website if unknown.
- Include a "🌟 Support The Project" section near the end asking users to star and share the repository.
- The LAST element of the markdown must be a clean, right-aligned footer badge that links back to Wharf (markdown: \`<div align="right">\n\n[![Documented by Wharf](https://img.shields.io/badge/Documented_by-Wharf-blueviolet)](https://github.com/trywharf/wharf)\n\n</div>\`).
- Keep it highly structured and scannable.`;
}
