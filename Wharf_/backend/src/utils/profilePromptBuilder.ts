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
  pinnedRepos?: { name: string; description: string; url: string; language: string; stars: number }[];
}

export interface ProfileOptions {
  template: 'minimal' | 'developer' | 'creative' | 'professional' | 'terminal';
  theme: string;
  githubBadges: string[]; // 'stars', 'followers', 'views'
  techStack: string[];
  social: { provider: string; url: string }[];
  showStats: boolean;
  showTopLanguages: boolean;
  showContributions: boolean;
  showTrophies: boolean;
  showStreak: boolean;
}

export const buildProfilePrompt = (profileData: ProfileData, options: ProfileOptions): string => {
  const { template, theme, githubBadges, techStack, social, showStats, showTopLanguages, showContributions, showTrophies, showStreak } = options;

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
${profileData.topLanguages.map(l => `- ${l.name}: ${l.percentage}%`).join('\n')}

DETECTED TECH STACK (Limit to what user selected or top stack):
${techStack.length > 0 ? techStack.join(', ') : profileData.techStack.join(', ')}

PINNED REPOSITORIES:
${profileData.pinnedRepos?.map(r => `- ${r.name}: ${r.description} (${r.language}, ${r.stars} stars)`).join('\n') || 'None'}

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
  <!-- Format: <a href="https://skillicons.dev" target="_blank" title="SkillName"><img src="https://skillicons.dev/icons?i=skillname" alt="SkillName" /></a> &nbsp;&nbsp; -->
  <!-- Ensure you only use valid skillicons identifiers, use groups if needed. Ask user's options techstack where possible -->
  ${(techStack.length > 0 ? techStack : profileData.techStack).map(tech => `<a href="https://skillicons.dev" target="_blank" title="${tech}"><img src="https://skillicons.dev/icons?i=${tech}" alt="${tech}" /></a> &nbsp;&nbsp;`).join('')}
</p>

##

${showStats ? `### 📊 GitHub Stats
<p align="center"> 
  <img height="180em" width="430" src="https://github-readme-stats-sigma-five.vercel.app/api?username=${profileData.username}&show_icons=true&theme=${theme}&include_all_commits=true&count_private=true"/> &nbsp;
  ${showTopLanguages ? `<img height="180em" width="386" src="https://github-readme-stats-sigma-five.vercel.app/api/top-langs/?username=${profileData.username}&layout=compact&theme=${theme}"/> <br>` : '<br>'}
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
${profileData.pinnedRepos?.length ? profileData.pinnedRepos.slice(0, 5).map(r => `| ${r.name} | ${r.description?.replace(/\\|/g, '')?.replace(/\|/g, '-') || ''} | ${r.stars} ⭐ | [View Repository](${r.url}) |`).join('\\n') : '| None | No repositories found | 0 ⭐ | - |'}

##` : ''}

${showTrophies ? `### 🏆 GitHub Trophies
<p align="center">
  <img src="https://github-trophies.vercel.app/?username=${profileData.username}&theme=${theme}&row=1&column=6" />
</p>

##` : ''}

<p align="right">
  <img align="right" src="https://res.cloudinary.com/dhn92qb61/image/upload/v1751383267/123_qcnao2.webp" height="180px" width="180px" />
</p>

### 🔗 Let's Connect!
I'd love to connect & explore new possibilities together. Send a spark my way! ⚡ <br>
<div align="left">
  ${social.map((s: any) => {
    const colors: Record<string, string> = { linkedin: '0077B5', github: '181717', portfolio: '3a86ff', gmail: 'EA4335', discord: '5865F2', twitter: '1DA1F2' };
    const color = colors[s.provider.toLowerCase()] || '181717';
    return `<a href="${s.url}" target="_blank"><img src="https://img.shields.io/badge/-${s.provider}-${color}?style=for-the-badge&logo=${s.provider.toLowerCase()}&logoColor=white" alt="${s.provider}"/></a> &nbsp;`;
  }).join('')}
</div>

##

<br>

<!-- Minimal Documentation Badge -->
<div align="right">
  <a href="https://trywharf.vercel.app/" target="_blank" style="text-decoration:none;display:inline-block;">
    <div style="display:inline-flex;align-items:center;gap:10px;padding:4px 12px;border:2px solid #eaeaea;border-radius:20px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      <div style="width:32px;height:32px;min-width:32px;border:1px solid #444444;border-radius:999px;display:flex;align-items:center;justify-content:center;background:#ffffff;">
        <img src="https://res.cloudinary.com/dhn92qb61/image/upload/v1777107144/Wharf_Logo-Photoroom_upscaled_tgvwm2.webp" alt="Wharf" style="width:32px;height:32px;object-fit:contain;" />
      </div>
      <div style="width:1px;height:18px;background:#444444;"></div>
      <span style="font-size:12px;color:#0f172a;font-weight:600;">Documented By Wharf</span>
    </div>
  </a>
</div>

Generate the profile README now perfectly following the format above. Do not include markdown code block wrappers:
`;
}