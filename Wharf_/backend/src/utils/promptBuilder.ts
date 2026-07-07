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
- Auto-generate a badges row at the top using Shields.io wrapped in \`<div align="center">\` and \`</div>\`. Ensure there is an intentional blank empty line immediately after the opening \`<div align="center">\`. Only generate these specific badges if applicable: Stars, LICENSE, Language, Frontend, Backend, AI, Last Commit, Issues, Pull Request. Use \`${context.meta.owner}\` for GitHub repo stats. Ensure every badge strictly follows this format if used: \`[![GitHub Stars](https://img.shields.io/github/stars/FrostByte-49/EcoSage?style=flat-square&color=yellow)](https://github.com/FrostByte-49/EcoSage/stargazers)\`.
- DO NOT put social badges (GitHub, LinkedIn, Website, etc.) under the top section. They MUST be in the "Author" section instead.
- After every section (e.g., Features, Preview, Project Structure), add a \`<br>\` tag to prevent cluttered text.
- If a "Features" section is included, strictly use standard bullet points without emojis, and make the main feature title in each bullet point **bold** (e.g. **AI Product Scanner**).
- If a "Preview" section is included, output a 2-column markdown table format where the header row contains bold labels (e.g., \`| **Home Page** | **Locations** |\`) and the data row immediately below contains image placeholders (use \`![Placeholder](https://placehold.co/600x400?text=Screenshot+Placeholder)\`). If multiple rows are needed, create separate smaller tables for each row, separated by blank lines.
- If "Technologies Used" or "Tech Stack" is included, display it in a clean markdown table with columns for "Technology" and "Purpose".
- If "System Architecture" is included, ALWAYS include a Mermaid.js diagram (\`\`\`mermaid\`) demonstrating the system logic and architecture. CRITICAL: Do NOT use parentheses \`()\` ANYWHERE inside mermaid — not in node labels, not in \`subgraph\` names, not in link labels. This causes syntax parse errors. Always use square brackets or plain strings (e.g. \`subgraph Client Side React Vite\` instead of \`subgraph Client-Side (React, Vite)\`, \`B[Backend API]\` instead of \`B(Backend API)\`).
- For "Project Structure", order the file tree exactly as an IDE would (directories first, then files within). Represent every directory name using a \`📁\` emoji Prefix (e.g. \`├── 📁src/\`). Add an extra empty line \`│\` after every directory block inside the tree so it looks clean. Use \`\`\`bash\` for the tree block and add inline comments.
- For "Getting Started", strictly mention environmental (.env) setup FIRST (if any) before guiding the user to backend and frontend setup. Use a strict step-by-step numbered format. After EACH COMPLETE numbered step section (including its explanation and any code block), add a lone \`#\` on its own line as a visual separator BEFORE the next numbered step heading. Do NOT add \`#\` inside a step or before a \`\`\`bash\`\`\` block. Use exactly the provided commands: \`${context.commands.install}\` and \`${context.commands.run}\`.
- If "API Reference" is requested, include an API Summary Table first (columns: Method, API, Description) and add a single \`#\` line immediately after it. Then format each detailed API with a numbered title (e.g. \`### 1) POST /api/analyze\`), and strictly add a single \`#\` line AFTER completing the ENTIRE description block for each API. Also, ensure you include "Customization" and "Future Enhancements" sections if applicable.
- For "Contributing", follow a highly detailed step-by-step layout under "How To Contribute" (e.g., 1. Fork, 2. Clone, 3. Branch, 4. Code, 5. Test, 6. Commit, 7. Push, 8. PR). After EACH COMPLETE numbered step (including any explanation and code block), add a lone \`#\` on its own line as a visual separator BEFORE the next numbered step heading. Do NOT add \`#\` inside a step or before a \`\`\`bash\`\`\` block. When a step contains a code block, add one blank line (a single empty line, not \`#\`, not \`---\`, not \`<br>\`) between the step's description text and the \`\`\`bash\`\`\` block. Also include a structured "Areas For Contribution" list preceded by a \`#\` separator line.
- For "License", just add this text: "This project is licensed under the MIT License. See the [LICENSE](https://github.com/${context.meta.owner}/${context.meta.name}/blob/main/LICENSE) file for details." Do not include the full license description text.
- For "Author", add the author's name in an **bold** tag followed by a \`<br><br>\` tags. Below the name, output a single line of badges for Website, GitHub, LinkedIn, Email, etc. using \`&nbsp;\` between each badge as spacing. Ensure the PR badge strictly follows this format if used: \`[![GitHub](https://img.shields.io/badge/GitHub-1e1e2f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/FrostByte-49) &nbsp;\`. 
- Include a "🌟 Support The Project" section near the end asking users to star and share the repository.
- The LAST element of the markdown must be a clean, right-aligned footer badge that links back to Wharf (use this exact HTML format: \`<br>\n\n<!-- Minimal Documentation Badge -->\n<p align="right">\n  <a href="https://trywharf.vercel.app/" target="_blank">\n    <img src="https://res.cloudinary.com/dhn92qb61/image/upload/v1782741355/wharf_badge__qguiv.png" alt="Documented By Wharf" width="200" height="auto" />\n  </a>\n</p>\`).
- Keep it highly structured and scannable.`;
}
