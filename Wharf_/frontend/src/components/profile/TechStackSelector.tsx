import { useState, useMemo } from 'react';
import { Badge, Button, Input } from '../ui';
import {
  Search,
  X,
  Code,
  ChevronDown,
  Layers,
  Zap,
  Palette,
  Settings,
  Database,
  Cloud,
  Smartphone,
  Wrench,
  Braces,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TechStackSelectorProps {
  selected: string[];
  onChange: (stack: string[]) => void;
  detectedStack: string[];
}

// Define The Skill Type
interface Skill {
  name: string;
  icon: string;
}

// Define The Category Structure
interface Category {
  icon: LucideIcon;
  skills: Skill[];
}

// Categorized Skills
const SKILL_CATEGORIES: Record<string, Category> = {
  Frontend: {
    icon: Palette,
    skills: [
      { name: 'Alpine.js', icon: 'alpinejs' },
      { name: 'Angular', icon: 'angular' },
      { name: 'Astro', icon: 'astro' },
      { name: 'Bootstrap', icon: 'bootstrap' },
      { name: 'CSS3', icon: 'css' },
      { name: 'Electron', icon: 'electron' },
      { name: 'Ember.js', icon: 'ember' },
      { name: 'Figma', icon: 'figma' },
      { name: 'Gatsby', icon: 'gatsby' },
      { name: 'HTML5', icon: 'html' },
      { name: 'HTMX', icon: 'htmx' },
      { name: 'JavaScript', icon: 'js' },
      { name: 'jQuery', icon: 'jquery' },
      { name: 'Lit', icon: 'lit' },
      { name: 'Next.js', icon: 'nextjs' },
      { name: 'Nuxt.js', icon: 'nuxtjs' },
      { name: 'p5.js', icon: 'p5js' },
      { name: 'React', icon: 'react' },
      { name: 'Remix', icon: 'remix' },
      { name: 'Sass', icon: 'sass' },
      { name: 'Solid.js', icon: 'solidjs' },
      { name: 'Svelte', icon: 'svelte' },
      { name: 'SVG', icon: 'svg' },
      { name: 'Tailwind CSS', icon: 'tailwind' },
      { name: 'Three.js', icon: 'threejs' },
      { name: 'TypeScript', icon: 'ts' },
      { name: 'Vue.js', icon: 'vue' },
      { name: 'Vuetify', icon: 'vuetify' },
      { name: 'WebAssembly', icon: 'wasm' },
      { name: 'Webflow', icon: 'webflow' },
      { name: 'Windi CSS', icon: 'windicss' },
    ],
  },
  'Backend & APIs': {
    icon: Settings,
    skills: [
      { name: 'Actix', icon: 'actix' },
      { name: 'AdonisJS', icon: 'adonis' },
      { name: 'Apollo GraphQL', icon: 'apollo' },
      { name: 'Deno', icon: 'deno' },
      { name: 'Django', icon: 'django' },
      { name: 'Elysia', icon: 'elysia' },
      { name: 'Express.js', icon: 'express' },
      { name: 'FastAPI', icon: 'fastapi' },
      { name: 'Flask', icon: 'flask' },
      { name: 'GraphQL', icon: 'graphql' },
      { name: 'Hibernate', icon: 'hibernate' },
      { name: 'Ktor', icon: 'ktor' },
      { name: 'Laravel', icon: 'laravel' },
      { name: 'NestJS', icon: 'nestjs' },
      { name: 'Node.js', icon: 'nodejs' },
      { name: 'PHP', icon: 'php' },
      { name: 'Rails', icon: 'rails' },
      { name: 'Rocket', icon: 'rocket' },
      { name: 'Spring', icon: 'spring' },
      { name: 'Symfony', icon: 'symfony' },
    ],
  },
  'Programming Languages': {
    icon: Braces,
    skills: [
      { name: 'C', icon: 'c' },
      { name: 'C#', icon: 'cs' },
      { name: 'C++', icon: 'cpp' },
      { name: 'Clojure', icon: 'clojure' },
      { name: 'CoffeeScript', icon: 'coffeescript' },
      { name: 'Crystal', icon: 'crystal' },
      { name: 'Dart', icon: 'dart' },
      { name: 'Elixir', icon: 'elixir' },
      { name: 'Forth', icon: 'forth' },
      { name: 'Fortran', icon: 'fortran' },
      { name: 'Go', icon: 'go' },
      { name: 'Haskell', icon: 'haskell' },
      { name: 'Haxe', icon: 'haxe' },
      { name: 'Java', icon: 'java' },
      { name: 'JavaScript', icon: 'js' },
      { name: 'Kotlin', icon: 'kotlin' },
      { name: 'Lua', icon: 'lua' },
      { name: 'MATLAB', icon: 'matlab' },
      { name: 'Mint', icon: 'mint' },
      { name: 'Nim', icon: 'nim' },
      { name: 'Nix', icon: 'nix' },
      { name: 'OCaml', icon: 'ocaml' },
      { name: 'Octave', icon: 'octave' },
      { name: 'Perl', icon: 'perl' },
      { name: 'PHP', icon: 'php' },
      { name: 'Plan 9', icon: 'plan9' },
      { name: 'Python', icon: 'py' },
      { name: 'R', icon: 'r' },
      { name: 'Ruby', icon: 'ruby' },
      { name: 'Rust', icon: 'rust' },
      { name: 'Scala', icon: 'scala' },
      { name: 'Solidity', icon: 'solidity' },
      { name: 'Swift', icon: 'swift' },
      { name: 'TypeScript', icon: 'ts' },
      { name: 'V', icon: 'v' },
      { name: 'Vala', icon: 'vala' },
      { name: 'Zig', icon: 'zig' },
    ],
  },
  'Databases & ORMs': {
    icon: Database,
    skills: [
      { name: 'Cassandra', icon: 'cassandra' },
      { name: 'DynamoDB', icon: 'dynamodb' },
      { name: 'Elasticsearch', icon: 'elasticsearch' },
      { name: 'MongoDB', icon: 'mongodb' },
      { name: 'MySQL', icon: 'mysql' },
      { name: 'PlanetScale', icon: 'planetscale' },
      { name: 'PostgreSQL', icon: 'postgres' },
      { name: 'Prisma', icon: 'prisma' },
      { name: 'Redis', icon: 'redis' },
      { name: 'Sequelize', icon: 'sequelize' },
      { name: 'SQLite', icon: 'sqlite' },
      { name: 'Supabase', icon: 'supabase' },
    ],
  },
  'DevOps & Cloud': {
    icon: Cloud,
    skills: [
      { name: 'Ansible', icon: 'ansible' },
      { name: 'AWS', icon: 'aws' },
      { name: 'Azure', icon: 'azure' },
      { name: 'Cloudflare', icon: 'cloudflare' },
      { name: 'Docker', icon: 'docker' },
      { name: 'GCP', icon: 'gcp' },
      { name: 'GitHub Actions', icon: 'githubactions' },
      { name: 'Grafana', icon: 'grafana' },
      { name: 'Heroku', icon: 'heroku' },
      { name: 'Jenkins', icon: 'jenkins' },
      { name: 'Kafka', icon: 'kafka' },
      { name: 'Kubernetes', icon: 'kubernetes' },
      { name: 'Netlify', icon: 'netlify' },
      { name: 'Nginx', icon: 'nginx' },
      { name: 'OpenShift', icon: 'openshift' },
      { name: 'OpenStack', icon: 'openstack' },
      { name: 'Prometheus', icon: 'prometheus' },
      { name: 'RabbitMQ', icon: 'rabbitmq' },
      { name: 'Red Hat', icon: 'redhat' },
      { name: 'Sentry', icon: 'sentry' },
      { name: 'Terraform', icon: 'terraform' },
      { name: 'Vercel', icon: 'vercel' },
      { name: 'Workers', icon: 'workers' },
    ],
  },
  'Mobile Development': {
    icon: Smartphone,
    skills: [
      { name: 'Android', icon: 'androidstudio' },
      { name: 'Flutter', icon: 'flutter' },
      { name: 'iOS', icon: 'apple' },
      { name: 'React Native', icon: 'react' },
      { name: 'Swift', icon: 'swift' },
      { name: 'Kotlin', icon: 'kotlin' },
      { name: 'Unity', icon: 'unity' },
    ],
  },
  'Game Development': {
    icon: Zap,
    skills: [
      { name: 'Bevy', icon: 'bevy' },
      { name: 'GameMaker Studio', icon: 'gamemakerstudio' },
      { name: 'Godot', icon: 'godot' },
      { name: 'OpenCV', icon: 'opencv' },
      { name: 'Roblox Studio', icon: 'robloxstudio' },
      { name: 'Unity', icon: 'unity' },
      { name: 'Unreal Engine', icon: 'unreal' },
    ],
  },
  'Data Science & ML': {
    icon: Settings,
    skills: [
      { name: 'Anaconda', icon: 'anaconda' },
      { name: 'MATLAB', icon: 'matlab' },
      { name: 'PyTorch', icon: 'pytorch' },
      { name: 'Scikit-Learn', icon: 'sklearn' },
      { name: 'TensorFlow', icon: 'tensorflow' },
    ],
  },
  'Tools & IDEs': {
    icon: Wrench,
    skills: [
      { name: 'Android Studio', icon: 'androidstudio' },
      { name: 'CLion', icon: 'clion' },
      { name: 'CMake', icon: 'cmake' },
      { name: 'CodePen', icon: 'codepen' },
      { name: 'Eclipse', icon: 'eclipse' },
      { name: 'Emacs', icon: 'emacs' },
      { name: 'Git', icon: 'git' },
      { name: 'GitHub', icon: 'github' },
      { name: 'GitLab', icon: 'gitlab' },
      { name: 'Gradle', icon: 'gradle' },
      { name: 'Gulp', icon: 'gulp' },
      { name: 'IntelliJ IDEA', icon: 'idea' },
      { name: 'Maven', icon: 'maven' },
      { name: 'Neovim', icon: 'neovim' },
      { name: 'Notion', icon: 'notion' },
      { name: 'npm', icon: 'npm' },
      { name: 'PhpStorm', icon: 'phpstorm' },
      { name: 'pnpm', icon: 'pnpm' },
      { name: 'Postman', icon: 'postman' },
      { name: 'PyCharm', icon: 'pycharm' },
      { name: 'Replit', icon: 'replit' },
      { name: 'Rider', icon: 'rider' },
      { name: 'Sublime Text', icon: 'sublime' },
      { name: 'Vim', icon: 'vim' },
      { name: 'Visual Studio', icon: 'visualstudio' },
      { name: 'VS Code', icon: 'vscode' },
      { name: 'VSCodium', icon: 'vscodium' },
      { name: 'WebStorm', icon: 'webstorm' },
      { name: 'Yarn', icon: 'yarn' },
    ],
  },
  'Build Tools & Bundlers': {
    icon: Settings,
    skills: [
      { name: 'Babel', icon: 'babel' },
      { name: 'Rollup.js', icon: 'rollupjs' },
      { name: 'Vite', icon: 'vite' },
      { name: 'Vitest', icon: 'vitest' },
      { name: 'Webpack', icon: 'webpack' },
    ],
  },
  'Frameworks & Libraries': {
    icon: Layers,
    skills: [
      { name: 'Bootstrap', icon: 'bootstrap' },
      { name: 'D3.js', icon: 'd3' },
      { name: 'Discord.js', icon: 'discordjs' },
      { name: 'Emotion', icon: 'emotion' },
      { name: 'GTK', icon: 'gtk' },
      { name: 'HaxeFlixel', icon: 'haxeflixel' },
      { name: 'Jest', icon: 'jest' },
      { name: 'Material-UI', icon: 'materialui' },
      { name: 'Pinia', icon: 'pinia' },
      { name: 'Pug', icon: 'pug' },
      { name: 'Qt', icon: 'qt' },
      { name: 'ReactiveX', icon: 'reactivex' },
      { name: 'Redux', icon: 'redux' },
      { name: 'Selenium', icon: 'selenium' },
      { name: 'Styled Components', icon: 'styledcomponents' },
      { name: 'Tailwind CSS', icon: 'tailwind' },
      { name: 'Tauri', icon: 'tauri' },
      { name: 'Vue.js', icon: 'vue' },
      { name: 'Yew', icon: 'yew' },
    ],
  },
  'Operating Systems': {
    icon: Settings,
    skills: [
      { name: 'Arch Linux', icon: 'arch' },
      { name: 'BSD', icon: 'bsd' },
      { name: 'Debian', icon: 'debian' },
      { name: 'Kali Linux', icon: 'kali' },
      { name: 'Linux', icon: 'linux' },
      { name: 'macOS', icon: 'apple' },
      { name: 'Raspberry Pi', icon: 'raspberrypi' },
      { name: 'Ubuntu', icon: 'ubuntu' },
      { name: 'Windows', icon: 'windows' },
    ],
  },
  'Social & Community': {
    icon: Cloud,
    skills: [
      { name: 'ActivityPub', icon: 'activitypub' },
      { name: 'Dev.to', icon: 'devto' },
      { name: 'Discord', icon: 'discord' },
      { name: 'Discord Bots', icon: 'bots' },
      { name: 'Fediverse', icon: 'fediverse' },
      { name: 'Instagram', icon: 'instagram' },
      { name: 'LinkedIn', icon: 'linkedin' },
      { name: 'Mastodon', icon: 'mastodon' },
      { name: 'Misskey', icon: 'misskey' },
      { name: 'Stack Overflow', icon: 'stackoverflow' },
      { name: 'Twitter', icon: 'twitter' },
    ],
  },
};

// Flatten Skills For Search
const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flatMap((cat) => cat.skills);

export const TechStackSelector = ({
  selected,
  onChange,
  detectedStack,
}: TechStackSelectorProps) => {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    // Main Categories
    Frontend: true,
    'Backend & APIs': true,
    'Programming Languages': true,
    'Databases & ORMs': false,
    'DevOps & Cloud': false,
    'Mobile Development': false,
    'Game Development': false,
    'Data Science & ML': false,
    'Tools & IDEs': false,
    'Build Tools & Bundlers': false,
    'Frameworks & Libraries': false,
    'Operating Systems': false,
    'Social & Community': false,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleToggle = (skillName: string) => {
    if (selected.includes(skillName)) {
      onChange(selected.filter((s) => s !== skillName));
    } else {
      onChange([...selected, skillName]);
    }
  };

  const handleMagicAutofill = () => {
    const parsedDetected = detectedStack.map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const matchedSkills = ALL_SKILLS.filter((skill) => {
      const skillLower = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return parsedDetected.some(
        (detected) => skillLower.includes(detected) || detected.includes(skillLower)
      );
    }).map((skill) => skill.name);

    onChange(Array.from(new Set([...selected, ...matchedSkills])));
  };

  const getSkillIcon = (skillName: string) => {
    const skill = ALL_SKILLS.find((s) => s.name === skillName);
    return skill ? `https://skillicons.dev/icons?i=${skill.icon}` : null;
  };

  // Filter Skills
  const filteredCategories = useMemo(() => {
    if (!search) return SKILL_CATEGORIES;

    const result: Record<string, Category> = {};
    Object.entries(SKILL_CATEGORIES).forEach(([category, data]) => {
      const filtered = data.skills.filter((skill) =>
        skill.name.toLowerCase().includes(search.toLowerCase())
      );
      if (filtered.length > 0) {
        result[category] = { icon: data.icon, skills: filtered };
      }
    });
    return result;
  }, [search]);

  const totalSelected = selected.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wharf-text-tertiary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search technologies..."
              className="pl-9 font-mono text-sm rounded-xl"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleMagicAutofill}
          className="flex items-center gap-2 h-11.5 rounded-xl"
        >
          <Zap className="w-4 h-4 text-wharf-pink-dark" />
          Auto-Fill
        </Button>
      </div>

      {/* Selected Skills */}
      {totalSelected > 0 && (
        <div className="p-4 bg-wharf-surface-secondary border-2 border-wharf-border-primary shadow-brutal-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-wharf-green-darker" />
              <span className="font-mono text-xs font-bold text-wharf-text-primary uppercase tracking-wider">
                Selected Skills |
              </span>
              <Badge variant="pink" size="sm">
                {totalSelected}
              </Badge>
            </div>
            <button
              onClick={() => onChange([])}
              className="flex items-center gap-1 font-mono text-[10px] text-wharf-text-tertiary hover:text-wharf-error transition-colors"
            >
              <X className="w-3 h-3" />
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((skill) => {
              const iconUrl = getSkillIcon(skill);
              return (
                <Badge
                  key={skill}
                  variant="cyan"
                  className="cursor-pointer gap-1.5 group hover:bg-wharf-pink transition-colors rounded-lg"
                  onClick={() => handleToggle(skill)}
                >
                  {iconUrl && (
                    <img src={iconUrl} alt={skill} className="w-3.5 h-3.5 object-contain" />
                  )}
                  {skill}
                  <X className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Skill Categories */}
      <div className="border-2 border-wharf-border-primary bg-wharf-surface-primary divide-y-3 divide-wharf-border-secondary">
        {Object.entries(filteredCategories).map(([category, data]) => {
          const isExpanded = expandedCategories[category];
          const categorySkills = data.skills;
          const CategoryIcon = data.icon;

          return (
            <div key={category} className="last:border-b-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-5 py-3 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon className="w-4 h-4 text-wharf-text-primary" />
                  <span className="font-mono text-xs font-bold text-wharf-text-primary uppercase tracking-wider">
                    {category} |
                  </span>
                  <Badge variant="cyan" size="sm">
                    {categorySkills.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {isExpanded && (
                    <span className="font-mono text-[9px] text-wharf-text-tertiary uppercase tracking-wider">
                      {categorySkills.filter((s) => selected.includes(s.name)).length} selected
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-wharf-text-tertiary transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Category Skills */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-1">
                  <div className="flex flex-wrap gap-2.5">
                    {categorySkills.map((skill) => {
                      const isSelected = selected.includes(skill.name);
                      const iconUrl = getSkillIcon(skill.name);

                      return (
                        <button
                          key={skill.name}
                          onClick={() => handleToggle(skill.name)}
                          className={`
                            group relative flex items-center gap-2 px-3 py-1.5 border-2 transition-all duration-200 cursor-pointer
                            ${
                              isSelected
                                ? 'bg-wharf-yellow/80 border-wharf-border-primary text-wharf-black font-bold shadow-brutal-sm -translate-y-px'
                                : 'bg-wharf-surface-secondary border-wharf-border-secondary text-wharf-text-secondary hover:border-wharf-yellow hover:bg-wharf-surface-primary'
                            }
                          `}
                        >
                          {iconUrl && (
                            <img
                              src={iconUrl}
                              alt={skill.name}
                              className="w-4 h-4 object-contain"
                            />
                          )}
                          <span
                            className={`font-mono text-xs ${
                              isSelected ? 'text-wharf-black' : 'text-wharf-text-secondary'
                            }`}
                          >
                            {skill.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(filteredCategories).length === 0 && (
          <div className="py-16 text-center">
            <Code className="w-10 h-10 text-wharf-text-tertiary mx-auto mb-4" />
            <p className="font-mono text-sm text-wharf-text-secondary capitalize">
              No matching technologies found
            </p>
            <p className="font-mono text-xs text-wharf-text-tertiary mt-1 capitalize">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[10px] font-mono text-wharf-text-tertiary ">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 capitalize">
            <Layers className="w-3 h-3" />
            {totalSelected} selected
          </span>
          <span className="text-wharf-border-primary">|</span>
          <span className="flex items-center gap-1 capitalize">
            <Code className="w-3 h-3" />
            {ALL_SKILLS.length} total
          </span>
        </div>
        {detectedStack.length > 0 && (
          <span className="flex items-center gap-1 text-wharf-green-darker capitalize">
            <Zap className="w-3 h-3" />
            {detectedStack.length} detected from profile
          </span>
        )}
      </div>
    </div>
  );
};
