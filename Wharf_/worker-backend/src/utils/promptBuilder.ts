import { RepoContext } from '../services/repo.service';

export function buildReadmePrompt(
  context: RepoContext,
  tone: 'technical' | 'recruiter' | 'beginner',
  sections: string[]
): string {
  const toneInstructions = {
    technical: `Write for developers and contributors. Be precise about implementation, architecture decisions, and technical requirements. Assume the reader is a developer.`,
    recruiter: `Write for hiring managers reviewing a portfolio. Highlight impact, problems solved, and key technical decisions. Use impact-focused language: "Built X that achieves Y using Z." Make it stand out to non-technical recruiters.`,
    beginner: `Write for open-source newcomers. Be welcoming, explain every setup step, use accessible language, and make contributing feel easy and inviting.`,
  };

  return `You are Wharf, an AI documentation engine. Generate a highly polished, professional README.md for this repository based on the parsed context. Every section MUST be detailed, complete, and rich in content — never truncate, summarize lazily, or skip any step. This is a non-negotiable quality requirement.

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

FILE TREE (up to 500 entries — use ALL of this to understand the full project structure):
${context.treePreview}

KEY FILES (inspect all files carefully for API routes, endpoints, features, env vars, and usage patterns):
${Object.entries(context.keyFiles)
  .map(([file, content]) => `--- File: ${file} ---\n${content.slice(0, 2000)}`)
  .join('\n\n')}

SECTIONS TO INCLUDE: ${sections.join(', ')}

RULES:
- Return ONLY the raw markdown content. Do NOT wrap it in markdown code blocks like \`\`\`markdown ... \`\`\`.
- Start with a descriptive, formatted repository title instead of just the repo name (e.g., "# 🧠 ${context.meta.name}: Project Overview").
- CRITICAL: Write a project overview description immediately following the title. It MUST be EXACTLY 2 full paragraphs — the first paragraph introduces the project, its purpose and core problem it solves; the second paragraph describes how it works technically, its key modules, and what makes it stand out. Each paragraph must be minimum 60 words.
- Auto-generate a badges row at the top using Shields.io wrapped in \`<div align="center">\` and \`</div>\`. Ensure there is an intentional blank empty line immediately after the opening \`<div align="center">\`. Only generate these specific badges if applicable: Stars, LICENSE, Language, Frontend, Backend, AI, Last Commit, Issues, Pull Request. Use \`${context.meta.owner}\` for GitHub repo stats. Ensure every badge strictly follows this format if used: \`[![GitHub Stars](https://img.shields.io/github/stars/FrostByte-49/EcoSage?style=flat-square&color=yellow)](https://github.com/FrostByte-49/EcoSage/stargazers)\`.
- DO NOT put social badges (GitHub, LinkedIn, Website, etc.) under the top section. They MUST be in the "Author" section instead.
- After every section (e.g., Features, Preview, Project Structure), add a \`<br>\` tag to prevent cluttered text.
- If a "Table of Contents" section is included, list items as standard dotted bullet points (e.g. \`- [Section Name](#section-name)\`). Do NOT number the TOC items. Do NOT use any emojis in TOC entries. Every requested section must appear in the TOC.
- If a "Features" section is included, strictly use standard bullet points without emojis, and make the main feature title in each bullet point **bold** (e.g. **AI Product Scanner**). Be exhaustive — list every meaningful feature identified from the codebase.
- If a "Preview" section is included, output a 2-column markdown table format where the header row contains bold labels (e.g., \`| **Home Page** | **Locations** |\`) and the data row immediately below contains image placeholders (use \`![Placeholder](https://placehold.co/600x400?text=Screenshot+Placeholder)\`). If multiple rows are needed, create separate smaller tables for each row, separated by blank lines. MUST INCLUDE THIS for visual health points.
- If "Technologies Used" or "Tech Stack" is included, display it in a clean markdown table with columns for "Technology" and "Purpose". MUST INCLUDE THIS for techStack health points.
- If "System Architecture" is included, ALWAYS include a Mermaid.js diagram (\`\`\`mermaid\`) demonstrating the system logic and architecture. CRITICAL: Do NOT use parentheses \`()\` ANYWHERE inside mermaid — not in node labels, not in \`subgraph\` names, not in link labels. This causes syntax parse errors. Always use square brackets or plain strings (e.g. \`subgraph Client Side React Vite\` instead of \`subgraph Client-Side (React, Vite)\`, \`B[Backend API]\` instead of \`B(Backend API)\`).
- For "Project Structure", generate a comprehensive file tree using all 500 file entries provided. The tree MUST include all major folders and every significant file — do not truncate or abbreviate with "..." or "etc". Order the tree exactly as an IDE would (directories first, then files within). Represent every directory name using a \`📁\` emoji Prefix (e.g. \`├── 📁src/\`). Add an extra empty line \`│\` after every directory block inside the tree so it looks clean. Use \`\`\`bash\` for the tree block and add inline comments explaining the purpose of every key file or folder. CRITICAL: All inline comments MUST be vertically aligned at the same column — pad each line with spaces so that every \`#\` comment symbol starts at exactly the same horizontal position (e.g. column 55). There must be at least 4 spaces of padding between the longest filename and its comment so nothing conflicts visually.
- For "Getting Started" or "Installation", strictly mention environmental (.env) setup FIRST (if any) before guiding the user to backend and frontend setup. Use all environment variables discovered in key files (e.g. \`.env.example\`) to document the .env section. Use a strict step-by-step numbered format. CRITICAL: You MUST use markdown code blocks (\`\`\`bash\`) for installation commands to pass the Repo Health check. After EACH COMPLETE numbered step section (including its explanation and any code block), add a lone \`#\` on its own line as a visual separator BEFORE the next numbered step heading.
- For "Usage" or "Examples", go beyond basic startup instructions. Explain how each PRIMARY FEATURE of the application can be used by the end user. For each feature, write a short description and provide a realistic usage example using markdown code blocks (e.g. API curl commands, code snippets, or CLI commands). Be specific to THIS project's actual features.
- CRITICAL — For "API Reference": The section heading MUST be exactly \`## API Reference\`. Thoroughly scan ALL key files provided (especially route files, controller files, index files, and server files) and extract EVERY API endpoint. Include ALL routes found. Under no circumstances should you omit any route. Start with an API Summary Table (columns: Method, Endpoint, Description, Auth Required). Add a single \`#\` line immediately after the table. Then format each detailed API with a numbered title (e.g. \`### 1) POST /api/analyze\`), including: Description, Request Body/Params (as a markdown code block), Response (as a markdown code block), and any notes. Strictly add a single \`#\` line AFTER each API block.
- CRITICAL — Always include dedicated "## Customization" and "## Future Enhancements" sections regardless of whether they are in the sections list. For "Customization", list all the ways a developer can configure, extend, or customize this specific project — minimum 5 items, written as bullet points with a **bold** title and a brief explanation (e.g. **Swap AI Provider** — Change the model string in \`ai.service.ts\` to use a different provider). For "Future Enhancements", list concrete, realistic improvements that could be made to THIS project — minimum 6 items, written as bullet points with a **bold** title and a brief explanation.
- For "Contributing", follow a highly detailed step-by-step layout under "How To Contribute". When a step contains a code block, add one blank line. Also include a structured "Areas For Contribution" list. Strictly add a lone \`#\` on its own line as a visual separator BEFORE the next numbered step & before the "Areas For Contribution" heading as well. MUST INCLUDE THIS for contribution health points.
- For "License", just add this text: "This project is licensed under the MIT License. See the [LICENSE](https://github.com/${context.meta.owner}/${context.meta.name}/blob/main/LICENSE) file for details." Do not include the full license description text. MUST INCLUDE THIS for license health points.
- For "Author", add the author's name in an **bold** tag followed by a \`<br><br>\` tags. Below the name, output a single line of badges for Website, GitHub, LinkedIn, Email, etc. using \`&nbsp;\` between each badge as spacing. Ensure the PR badge strictly follows this format if used: \`[![GitHub](https://img.shields.io/badge/GitHub-1e1e2f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/FrostByte-49) &nbsp;\`. 
- Include a "🌟 Support The Project" section near the end asking users to star and share the repository.
- The LAST element of the markdown must be a clean, right-aligned footer badge that links back to Wharf (use this exact HTML format: \`<br>\n\n<!-- Minimal Documentation Badge -->\n<p align="right">\n  <a href="https://trywharf.vercel.app/" target="_blank">\n    <img src="https://res.cloudinary.com/dhn92qb61/image/upload/v1782741355/wharf_badge__qguiv.png" alt="Documented By Wharf" width="200" height="auto" />\n  </a>\n</p>\`).
- Keep it highly structured, scannable, and exhaustive. When in doubt, write more — this README should feel like authoritative, living documentation for the project.`;
}

