import { RepoContext } from '../services/repo.service';

export function buildChatPrompt(params: {
  question: string;
  persona: string;
  repoContext: RepoContext;
}): string {
  const { meta, frameworks, treePreview, keyFiles } = params.repoContext;

  return `
You are a helpful AI assistant analyzing a GitHub repository.
Persona: ${params.persona}

Repository Context:
- Name: ${meta.name}
- URL: https://github.com/${meta.owner}/${meta.name}
- Description: ${meta.description || 'No description provided.'}
- Tech Stack: ${frameworks.join(', ')}
- File Structure Snapshot: 
${treePreview}
- README Snippet:
${keyFiles['README.md'] ? keyFiles['README.md'].slice(0, 2000) : 'Not available'}

Question: ${params.question}

Provide a clear, detailed, and helpful response based on the repository context.

Important Rules:
- When generating clone commands or setup instructions, ALWAYS use the explicit Repository URL provided above instead of placeholders like <repository-url>.
- Use proper markdown formatting. Ensure blocks of code are enclosed in backticks.

${getPersonaInstructions(params.persona)}
`;
}

function getPersonaInstructions(persona: string): string {
  const instructions: Record<string, string> = {
    developer: 'Focus on code structure, best practices, and implementation details.',
    interviewer: 'Generate potential interview questions and evaluate code quality.',
    product: 'Focus on business value, features, and roadmap.',
    security: 'Identify security vulnerabilities and recommend fixes.',
  };
  return instructions[persona.toLowerCase()] || instructions.developer;
}
