export interface ProfileData {
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  company?: string;
  location?: string;
  followers: number;
  following: number;
  repos: number;
  totalStars: number;
  totalForks: number;
  topLanguages: { name: string; percentage: number }[];
  techStack: string[];
  contributions: number;
  joinDate: string;
  pinnedRepos?: {
    name: string;
    description: string;
    url: string;
    language: string;
    stars: number;
  }[];
}

export interface ProfileOptions {
  template: 'minimal' | 'developer' | 'creative' | 'professional' | 'terminal';
  theme: string;
  githubBadges: string[];
  techStack: string[];
  social: { provider: string; url: string }[];
  showStats: boolean;
  showTopLanguages: boolean;
  showContributions: boolean;
  showTrophies: boolean;
  showStreak: boolean;
}

export const buildProfilePrompt = (profileData: ProfileData, options: ProfileOptions): string => {
  const {
    template,
    theme,
    githubBadges,
    techStack,
    social,
    showStats,
    showTopLanguages,
    showContributions,
    showTrophies,
    showStreak,
  } = options;

  const mapTechToIcon = (name: string): string => {
    const map: Record<string, string> = {
      // Frontend
      'Alpine.js': 'alpinejs',
      Angular: 'angular',
      Astro: 'astro',
      Bootstrap: 'bootstrap',
      CSS3: 'css',
      Electron: 'electron',
      'Ember.js': 'ember',
      Figma: 'figma',
      Gatsby: 'gatsby',
      HTML5: 'html',
      HTMX: 'htmx',
      JavaScript: 'js',
      jQuery: 'jquery',
      Lit: 'lit',
      'Next.js': 'nextjs',
      'Nuxt.js': 'nuxtjs',
      'p5.js': 'p5js',
      React: 'react',
      Remix: 'remix',
      Sass: 'sass',
      'Solid.js': 'solidjs',
      Svelte: 'svelte',
      SVG: 'svg',
      'Tailwind CSS': 'tailwind',
      'Three.js': 'threejs',
      TypeScript: 'ts',
      'Vue.js': 'vue',
      Vuetify: 'vuetify',
      WebAssembly: 'wasm',
      Webflow: 'webflow',
      'Windi CSS': 'windicss',

      // Backend & APIs
      Actix: 'actix',
      AdonisJS: 'adonis',
      'Apollo GraphQL': 'apollo',
      Deno: 'deno',
      Django: 'django',
      Elysia: 'elysia',
      'Express.js': 'express',
      FastAPI: 'fastapi',
      Flask: 'flask',
      GraphQL: 'graphql',
      Hibernate: 'hibernate',
      Ktor: 'ktor',
      Laravel: 'laravel',
      NestJS: 'nestjs',
      'Node.js': 'nodejs',
      PHP: 'php',
      Rails: 'rails',
      Rocket: 'rocket',
      Spring: 'spring',
      Symfony: 'symfony',

      // Programming Languages
      C: 'c',
      'C#': 'cs',
      'C++': 'cpp',
      Clojure: 'clojure',
      CoffeeScript: 'coffeescript',
      Crystal: 'crystal',
      Dart: 'dart',
      Elixir: 'elixir',
      Forth: 'forth',
      Fortran: 'fortran',
      Go: 'go',
      Haskell: 'haskell',
      Haxe: 'haxe',
      Java: 'java',
      Kotlin: 'kotlin',
      Lua: 'lua',
      MATLAB: 'matlab',
      Mint: 'mint',
      Nim: 'nim',
      Nix: 'nix',
      OCaml: 'ocaml',
      Octave: 'octave',
      Perl: 'perl',
      'Plan 9': 'plan9',
      Python: 'py',
      R: 'r',
      Ruby: 'ruby',
      Rust: 'rust',
      Scala: 'scala',
      Solidity: 'solidity',
      Swift: 'swift',
      V: 'v',
      Vala: 'vala',
      Zig: 'zig',

      // Databases & ORMs
      Cassandra: 'cassandra',
      DynamoDB: 'dynamodb',
      Elasticsearch: 'elasticsearch',
      MongoDB: 'mongodb',
      MySQL: 'mysql',
      PlanetScale: 'planetscale',
      PostgreSQL: 'postgres',
      Prisma: 'prisma',
      Redis: 'redis',
      Sequelize: 'sequelize',
      SQLite: 'sqlite',
      Supabase: 'supabase',

      // DevOps & Cloud
      Ansible: 'ansible',
      AWS: 'aws',
      Azure: 'azure',
      Cloudflare: 'cloudflare',
      Docker: 'docker',
      GCP: 'gcp',
      'GitHub Actions': 'githubactions',
      Grafana: 'grafana',
      Heroku: 'heroku',
      Jenkins: 'jenkins',
      Kafka: 'kafka',
      Kubernetes: 'kubernetes',
      Netlify: 'netlify',
      Nginx: 'nginx',
      OpenShift: 'openshift',
      OpenStack: 'openstack',
      Prometheus: 'prometheus',
      RabbitMQ: 'rabbitmq',
      'Red Hat': 'redhat',
      Sentry: 'sentry',
      Terraform: 'terraform',
      Vercel: 'vercel',
      Workers: 'workers',

      // Mobile Development
      Android: 'androidstudio',
      Flutter: 'flutter',
      iOS: 'apple',
      'React Native': 'react',
      Unity: 'unity',

      // Game Development
      Bevy: 'bevy',
      'GameMaker Studio': 'gamemakerstudio',
      Godot: 'godot',
      OpenCV: 'opencv',
      'Roblox Studio': 'robloxstudio',
      'Unreal Engine': 'unreal',

      // Data Science & ML
      Anaconda: 'anaconda',
      PyTorch: 'pytorch',
      'Scikit-Learn': 'sklearn',
      TensorFlow: 'tensorflow',

      // Tools & IDEs
      'Android Studio': 'androidstudio',
      CLion: 'clion',
      CMake: 'cmake',
      CodePen: 'codepen',
      Eclipse: 'eclipse',
      Emacs: 'emacs',
      Git: 'git',
      GitHub: 'github',
      GitLab: 'gitlab',
      Gradle: 'gradle',
      Gulp: 'gulp',
      'IntelliJ IDEA': 'idea',
      Maven: 'maven',
      Neovim: 'neovim',
      Notion: 'notion',
      npm: 'npm',
      PhpStorm: 'phpstorm',
      pnpm: 'pnpm',
      Postman: 'postman',
      PyCharm: 'pycharm',
      Replit: 'replit',
      Rider: 'rider',
      'Sublime Text': 'sublime',
      Vim: 'vim',
      'Visual Studio': 'visualstudio',
      'VS Code': 'vscode',
      VSCodium: 'vscodium',
      WebStorm: 'webstorm',
      Yarn: 'yarn',

      // Build Tools & Bundlers
      Babel: 'babel',
      'Rollup.js': 'rollupjs',
      Vite: 'vite',
      Vitest: 'vitest',
      Webpack: 'webpack',

      // Frameworks & Libraries
      'D3.js': 'd3',
      'Discord.js': 'discordjs',
      Emotion: 'emotion',
      GTK: 'gtk',
      HaxeFlixel: 'haxeflixel',
      Jest: 'jest',
      'Material-UI': 'materialui',
      Pinia: 'pinia',
      Pug: 'pug',
      Qt: 'qt',
      ReactiveX: 'reactivex',
      Redux: 'redux',
      Selenium: 'selenium',
      'Styled Components': 'styledcomponents',
      Tauri: 'tauri',
      Yew: 'yew',

      // Operating Systems
      'Arch Linux': 'arch',
      BSD: 'bsd',
      Debian: 'debian',
      'Kali Linux': 'kali',
      Linux: 'linux',
      macOS: 'apple',
      'Raspberry Pi': 'raspberrypi',
      Ubuntu: 'ubuntu',
      Windows: 'windows',

      // Social & Community
      ActivityPub: 'activitypub',
      'Dev.to': 'devto',
      Discord: 'discord',
      'Discord Bots': 'bots',
      Fediverse: 'fediverse',
      Instagram: 'instagram',
      LinkedIn: 'linkedin',
      Mastodon: 'mastodon',
      Misskey: 'misskey',
      'Stack Overflow': 'stackoverflow',
      Twitter: 'twitter',
    };

    return map[name] || name.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const stackToUse = techStack.length > 0 ? techStack : profileData.techStack;
  const slugs = stackToUse.map((tech: string) => mapTechToIcon(tech)).join(',');
  const formattedStack = `  <img \n    src="https://skillicons.dev/icons?i=${slugs}&perline=18"\n    width="100%"\n  />`;

  return `
You are an expert GitHub profile README designer and Markdown writer.
Your task is to generate a stunning GitHub Profile README for the user, matching the exact requested structural layout.

USER PROFILE DATA:
Username: ${profileData.username}
Name: ${profileData.name}
Bio: ${profileData.bio}
Company: ${profileData.company || 'N/A'}
Location: ${profileData.location || 'N/A'}
Followers: ${profileData.followers} | Following: ${profileData.following}
Total Repositories: ${profileData.repos}
Total Stars Received: ${profileData.totalStars}
Account Created Date: ${profileData.joinDate}

TOP LANGUAGES:
${profileData.topLanguages.map((l) => `- ${l.name}: ${l.percentage}%`).join('\n')}

DETECTED TECH STACK (Limit to what user selected or top stack):
${techStack.length > 0 ? techStack.join(', ') : profileData.techStack.join(', ')}

PINNED REPOSITORIES:
${profileData.pinnedRepos?.map((r) => `- ${r.name}: ${r.description} (${r.language}, ${r.stars} stars)`).join('\n') || 'None'}

### REQUIRED OUTPUT FORMAT:

You must format your response EXACTLY following this Markdown structure. 
DO NOT wrap the response in a JSON block. Output raw markdown only.

<h1 align="left">${profileData.name} <img align="center" src="https://media.giphy.com/media/lGhBlBMIN2XsEteTN3/giphy.gif" width="80" alt="Coding GIF"/></h1>

  <!-- Use 2-3 short, punchy descriptors wrapped in inline code blocks like badges -->
  **\`Sub-role 1 (e.g. Full Stack Developer)\`** &nbsp; **\`Sub-role 2\`** &nbsp; **\`Sub-role 3\`**


### 🌟 About Me
[Generate a compelling 2 paragraph 'About Me' using the Bio and User Data]

<!-- If the user provided custom social/contact badges in the options -->
<div align="left" style="display: flex; flex-wrap: wrap;">
  ${githubBadges.includes('stars') ? `<a href="https://github.com/${profileData.username}?tab=repositories&sort=stargazers" style="text-decoration: none;"><img alt="Total Stars" title="Total Stars" src="https://img.shields.io/github/stars/${profileData.username}?style=for-the-badge&color=FF69B4&label=Stars&logo=github&logoColor=white&labelColor=E91E63" /></a>&nbsp;` : ''}
  ${githubBadges.includes('followers') ? `<a href="https://github.com/${profileData.username}?tab=followers" style="text-decoration: none;"><img alt="GitHub Followers" title="Followers" src="https://img.shields.io/github/followers/${profileData.username}?style=for-the-badge&color=BA68C8&label=Followers&logo=github&logoColor=white&labelColor=8E24AA" /></a>&nbsp;` : ''}
  ${githubBadges.includes('views') ? `<a href="https://github.com/${profileData.username}" style="text-decoration: none;"><img alt="Profile Views" title="Views" src="https://komarev.com/ghpvc/?username=${profileData.username}&color=FF69B4&style=for-the-badge&labelColor=FF69B4&logo=github&logoColor=white&label=Visitors"/></a>` : ''}
</div>

##

### ⚙ Languages & Technologies <br><br>

<p align="left">
  <!-- Generate skillicons.dev icons based off the DETECTED TECH STACK -->
  <!-- Format: -->
  <!-- <img -->
  <!--   src="https://skillicons.dev/icons?i=slug1,slug2,slug3&perline=18" -->
  <!--   width="100%" -->
  <!-- /> -->
${formattedStack}
</p>

##

${
  showStats
    ? `### 📊 GitHub Stats
<p align="center"> 
  <img height="180em" width="430" src="https://github-stats-extended.vercel.app/api?username=${profileData.username}&show_icons=true&theme=${theme}&include_all_commits=true&count_private=true"/> &nbsp;
  ${showTopLanguages ? `<img height="180em" width="386" src="https://github-stats-extended.vercel.app/api/top-langs/?username=${profileData.username}&layout=compact&theme=${theme}"/> <br>` : '<br>'}
  ${showStreak ? `<img src="https://streak-stats.demolab.com?user=${profileData.username}&theme=${theme}" />` : ''}
</p>

##
### 📈 Contribution Graph
<p align="center">
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=${profileData.username}&theme=${theme}" alt="Contribution Graph" />
</p>

##
### 🌟 Top Repositories

| Name | Description | Stars | Links |
|---|---|---|---|
${
  profileData.pinnedRepos?.length
    ? profileData.pinnedRepos
        .slice(0, 5)
        .map(
          (r) =>
            `| ${r.name} | ${r.description?.replace(/\\|/g, '')?.replace(/\|/g, '-') || ''} | ${r.stars} ⭐ | [View Repository](${r.url}) |`
        )
        .join('\\n')
    : '| None | No repositories found | 0 ⭐ | - |'
}

##`
    : ''
}

${
  showTrophies
    ? `### 🏆 GitHub Trophies
<p align="center">
  <img src="https://github-trophies.vercel.app/?username=${profileData.username}&theme=${theme}&row=1&column=6" />
</p>

##`
    : ''
}

<p align="right">
  <img align="right" src="https://res.cloudinary.com/dhn92qb61/image/upload/v1751383267/123_qcnao2.webp" height="180px" width="180px" />
</p>

### 🔗 Let's Connect!
I'd love to connect & explore new possibilities together. Send a spark my way! ⚡ <br>
<div align="left">
  ${social
    .map((s: any) => {
      const colors: Record<string, string> = {
        linkedin: '0077B5',
        github: '181717',
        portfolio: '3a86ff',
        gmail: 'EA4335',
        discord: '5865F2',
        twitter: '1DA1F2',
      };
      const color = colors[s.provider.toLowerCase()] || '181717';
      return `<a href="${s.url}" target="_blank"><img src="https://img.shields.io/badge/-${s.provider}-${color}?style=for-the-badge&logo=${s.provider.toLowerCase()}&logoColor=white" alt="${s.provider}"/></a> &nbsp;`;
    })
    .join('')}
</div>

##

<br>

<!-- Minimal Documentation Badge -->
<p align="right">
  <a href="https://trywharf.vercel.app/" target="_blank">
    <img src="https://res.cloudinary.com/dhn92qb61/image/upload/v1782741355/wharf_badge__qguiv.png" alt="Documented By Wharf" width="200" height="auto" />
  </a>
</p>

Generate the profile README now perfectly following the format above. Do not include markdown code block wrappers:
`;
};
