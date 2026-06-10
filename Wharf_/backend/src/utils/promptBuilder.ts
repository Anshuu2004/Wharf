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
- Start directly with the repository title: "# ${context.meta.name}"
- Auto-generate a beautiful badges row at the top using Shields.io urls (e.g. build standard shields.io badges for stars, forks, license, main language, and a badge linking to this project if possible).
- Installation section must use the exact install/run commands provided above: \`${context.commands.install}\` and \`${context.commands.run}\`.
- Ensure all sections mentioned in SECTIONS TO INCLUDE are represented clearly.
- If there are no screenshots in the repo, add visual placeholder HTML comment blocks where screenshots should go.
- End with a clean footer badge that links back to Wharf (markdown: [![Documented by Wharf](https://img.shields.io/badge/Documented_by-Wharf-blueviolet)](https://github.com/trywharf/wharf)).
- Keep it highly structured and scannable with correct headings, lists, and code blocks.`;
}
