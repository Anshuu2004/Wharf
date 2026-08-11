export const generatePreviewMarkdown = (
  profileData: {
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
  },
  options: {
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
    birthday?: string;
  }
): string => {
  if (!profileData) return '';

  if (options.template === 'terminal') {
    return `
# 🖥️ Terminal Profile Setup Guide

Your personalized Terminal profile will run entirely on your own GitHub account using GitHub Actions.

When you click **Generate**, we will output your personalized code package including:
- \`README.md\` (With the dynamic SVGs)
- \`today.py\` (Customized tracker with your username and precise birthdate ${options.birthday || '2000-01-01'})
- \`.github/workflows/update-readme.yml\` (To run daily)
- \`.env.example\`

The final generated template will allow you to display live metrics of your commits based on the viral Andrew6rant tracker. Click **Generate** below to proceed!
`;
  }

  const tech = options.techStack.length > 0 ? options.techStack : profileData.techStack;

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

  const slugs = tech.map((t: string) => mapTechToIcon(t)).join(',');
  const formattedStack = `  <img \n    src="https://skillicons.dev/icons?i=${slugs}&perline=18"\n    width="100%"\n  />`;

  // Helper Function To Map Social Providers
  const getSocialColor = (provider: string): string => {
    const colors: Record<string, string> = {
      linkedin: '0077B5',
      github: '181717',
      portfolio: '3a86ff',
      gmail: 'EA4335',
      discord: '5865F2',
      twitter: '1DA1F2',
    };
    return colors[provider.toLowerCase()] || '181717';
  };

  return `
<h1 align="left">${profileData.name} <img align="center" src="https://media.giphy.com/media/lGhBlBMIN2XsEteTN3/giphy.gif" width="80" alt="Coding GIF"/></h1>

  **\`Sub-role 1\`** &nbsp; **\`Sub-role 2\`** &nbsp; **\`Sub-role 3\`**


### 🌟 About Me
${profileData.bio || 'A passionate developer from ' + (profileData.location || 'Earth') + '. I enjoy building tools and applications.'}

##
### ⚙ Languages & Technologies <br><br>

<p align="left">
${formattedStack}
</p>

##
${
  options.showStats
    ? `### 📊 GitHub Stats <br><br>
<p align="center"> 
  <img height="180em" width="430" src="https://github-stats-extended.vercel.app/api?username=${profileData.username}&show_icons=true&theme=${options.theme}&include_all_commits=true&count_private=true"/> &nbsp;
  ${
    options.showTopLanguages
      ? `<img height="180em" width="386" src="https://github-stats-extended.vercel.app/api/top-langs/?username=${profileData.username}&layout=compact&theme=${options.theme}"/> <br>`
      : '<br>'
  }
  ${
    options.showStreak
      ? `<img src="https://streak-stats.demolab.com?user=${profileData.username}&theme=${options.theme}" />`
      : ''
  }
</p>

##
### 📈 Contribution Graph
<p align="center">
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=${profileData.username}&theme=${options.theme}" alt="Contribution Graph" />
</p>

##
### 🌟 Top Repositories

| Name | Description | Stars | Links |
|---|---|---|---|
${
  profileData.pinnedRepos && profileData.pinnedRepos.length > 0
    ? profileData.pinnedRepos
        .slice(0, 5)
        .map(
          (r) =>
            `| ${r.name} | ${r.description?.replace(/\\|/g, '-') || ''} | ${r.stars} ⭐ | [View Repository](${r.url}) |`
        )
        .join('\\n')
    : '| None | No repositories found | 0 ⭐ | - |'
}

##`
    : ''
}

${
  options.showTrophies
    ? `### 🏆 GitHub Trophies
<p align="center">
  <img src="https://github-trophies.vercel.app/?username=${profileData.username}&theme=${options.theme}&row=1&column=6" />
</p>

##`
    : ''
}

### 🔗 Let's Connect!
I'd love to connect & explore new possibilities together. Send a spark my way! ⚡ <br>
<div align="left">
  ${options.social
    .map(
      (s) =>
        `<a href="${s.url}" target="_blank"><img src="https://img.shields.io/badge/-${s.provider}-${getSocialColor(s.provider)}?style=for-the-badge&logo=${s.provider.toLowerCase()}&logoColor=white" alt="${s.provider}"/></a> &nbsp;`
    )
    .join('')}
</div>
`;
};
