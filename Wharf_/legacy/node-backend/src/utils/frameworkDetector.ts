export interface FrameworkInfo {
  name: string;
  installCommand: string;
  runCommand: string;
}

const FRAMEWORKS: Record<string, FrameworkInfo> = {
  react: {
    name: 'React',
    installCommand: 'npm install',
    runCommand: 'npm start',
  },
  vite: {
    name: 'Vite',
    installCommand: 'npm install',
    runCommand: 'npm run dev',
  },
  nextjs: {
    name: 'Next.js',
    installCommand: 'npm install',
    runCommand: 'npm run dev',
  },
  express: {
    name: 'Express',
    installCommand: 'npm install',
    runCommand: 'npm start',
  },
  django: {
    name: 'Django',
    installCommand: 'pip install -r requirements.txt',
    runCommand: 'python manage.py runserver',
  },
  flask: {
    name: 'Flask',
    installCommand: 'pip install -r requirements.txt',
    runCommand: 'flask run',
  },
  fastapi: {
    name: 'FastAPI',
    installCommand: 'pip install -r requirements.txt',
    runCommand: 'uvicorn main:app --reload',
  },
  vue: {
    name: 'Vue.js',
    installCommand: 'npm install',
    runCommand: 'npm run serve',
  },
  svelte: {
    name: 'Svelte',
    installCommand: 'npm install',
    runCommand: 'npm run dev',
  },
};

// Detects Frameworks Based On File Patterns And Package Dependencies.
export function detectFrameworks(files: string[], packageJson?: any): string[] {
  const detected: Set<string> = new Set();

  // Check package.json Dependencies
  if (packageJson) {
    const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };

    if (deps['react']) detected.add('react');
    if (deps['vite']) detected.add('vite');
    if (deps['next']) detected.add('nextjs');
    if (deps['express']) detected.add('express');
    if (deps['vue']) detected.add('vue');
    if (deps['svelte']) detected.add('svelte');
  }

  // Check File Patterns If Not Detected Via package.json
  files.forEach((file) => {
    if (file.includes('manage.py')) detected.add('django');
    if (file.includes('requirements.txt')) {
      // Basic Check, Could Be Improved By Reading Content
    }
  });

  return Array.from(detected);
}

// Returns Install And Run Commands For A List Of Detected Frameworks.
export function getCommands(frameworks: string[]): { install: string; run: string } {
  const commands = {
    install: 'npm install', // Default
    run: 'npm start', // Default
  };

  for (const fw of frameworks) {
    if (FRAMEWORKS[fw]) {
      commands.install = FRAMEWORKS[fw].installCommand;
      commands.run = FRAMEWORKS[fw].runCommand;
      break; // Use The First Detected Framework's Commands
    }
  }

  return commands;
}
