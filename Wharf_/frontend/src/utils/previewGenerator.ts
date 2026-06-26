export const generatePreviewMarkdown = (profileData: any, options: any) => {
  if (!profileData) return ''
  const tech = options.techStack.length > 0 ? options.techStack : profileData.techStack
  
  return `
<h1 align="left">${profileData.name} <img align="center" src="https://media.giphy.com/media/lGhBlBMIN2XsEteTN3/giphy.gif" width="80" alt="Coding GIF"/></h1>

  **\`Sub-role 1\`** &nbsp; **\`Sub-role 2\`** &nbsp; **\`Sub-role 3\`**


### 🌟 About Me
${profileData.bio || 'A passionate developer from ' + (profileData.location || "Earth") + '. I enjoy building tools and applications.'}

##
### ⚙ Languages & Technologies <br><br>
<p align="left">
  ${tech.map((t: string) => `<a href="https://skillicons.dev" target="_blank" title="${t}"><img src="https://skillicons.dev/icons?i=${t}" alt="${t}" /></a> &nbsp;&nbsp;`).join('')}
</p>

##
${options.showStats ? `### 📊 GitHub Stats <br><br>
<p align="center"> 
  <img height="180em" width="430" src="https://github-readme-stats-sigma-five.vercel.app/api?username=${profileData.username}&show_icons=true&theme=${options.theme}&include_all_commits=true&count_private=true"/> &nbsp;
  ${options.showTopLanguages ? `<img height="180em" width="386" src="https://github-readme-stats-sigma-five.vercel.app/api/top-langs/?username=${profileData.username}&layout=compact&theme=${options.theme}"/> <br>` : '<br>'}
  ${options.showStreak ? `<img src="https://streak-stats.demolab.com?user=${profileData.username}&theme=${options.theme}" />` : ''}
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
${profileData.pinnedRepos?.length ? profileData.pinnedRepos.slice(0, 5).map((r: any) => `| ${r.name} | ${r.description?.replace(/\\|/g, '-') || ''} | ${r.stars} ⭐ | [View Repository](${r.url}) |`).join('\\n') : '| None | No repositories found | 0 ⭐ | - |'}

##` : ''}

${options.showTrophies ? `### 🏆 GitHub Trophies
<p align="center">
  <img src="https://github-trophies.vercel.app/?username=${profileData.username}&theme=${options.theme}&row=1&column=6" />
</p>

##` : ''}

### 🔗 Let's Connect!
I'd love to connect & explore new possibilities together. Send a spark my way! ⚡ <br>
<div align="left">
  ${options.social.map((s: any) => {
    const colors: Record<string, string> = { linkedin: '0077B5', github: '181717', portfolio: '3a86ff', gmail: 'EA4335', discord: '5865F2', twitter: '1DA1F2' };
    const color = colors[s.provider.toLowerCase()] || '181717';
    return `<a href="${s.url}" target="_blank"><img src="https://img.shields.io/badge/-${s.provider}-${color}?style=for-the-badge&logo=${s.provider.toLowerCase()}&logoColor=white" alt="${s.provider}"/></a> &nbsp;`;
  }).join('')}
</div>
`
}
