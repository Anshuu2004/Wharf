import { useState } from 'react';
import {
  RefreshCw,
  Edit2,
  Check,
  X,
  Wand2,
  Type,
  Briefcase,
  Palette,
  Code,
  Smile,
  ChevronDown,
} from 'lucide-react';
import { Input, Button } from '../ui';

interface BioGeneratorProps {
  bio: string;
  onGenerate: (bio: string) => void;
}

const bioTones = [
  { id: 'professional', label: 'Professional', icon: Briefcase, color: 'text-wharf-cyan-darker' },
  { id: 'creative', label: 'Creative', icon: Palette, color: 'text-wharf-yellow-darker' },
  { id: 'technical', label: 'Technical', icon: Code, color: 'text-wharf-purple-darker' },
  { id: 'fun', label: 'Fun', icon: Smile, color: 'text-wharf-yellow-darker' },
];

const bioLengths = [
  { id: 'short', label: 'Short', chars: 60 },
  { id: 'medium', label: 'Medium', chars: 120 },
  { id: 'long', label: 'Long', chars: 200 },
];

export const BioGenerator = ({ bio, onGenerate }: BioGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(bio);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [isToneOpen, setIsToneOpen] = useState(false);
  const [isLengthOpen, setIsLengthOpen] = useState(false);

  const handleAIGenerate = async () => {
    setIsGenerating(true);

    setTimeout(() => {
      const lengthMap = {
        short: 'Full Stack Developer | React | TypeScript',
        medium:
          'Full Stack Developer passionate about building impactful applications with modern technologies.',
        long: 'Full Stack Developer with a passion for building impactful applications. Experienced in React, TypeScript, and Node.js. Always learning and exploring new technologies.',
      };

      const toneMap = {
        professional: '',
        creative: 'Creative problem solver ',
        technical: 'Tech enthusiast ',
        fun: 'Code lover ',
      };

      const newBio = `${toneMap[selectedTone as keyof typeof toneMap] || ''}${lengthMap[selectedLength as keyof typeof lengthMap]}`;
      onGenerate(newBio);
      setEditBio(newBio);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSaveEdit = () => {
    onGenerate(editBio);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditBio(bio);
    setIsEditing(false);
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const getSelectedTone = () => {
    return bioTones.find((t) => t.id === selectedTone) || bioTones[0];
  };

  const getSelectedLength = () => {
    return bioLengths.find((l) => l.id === selectedLength) || bioLengths[0];
  };

  const SelectedToneIcon = getSelectedTone().icon;

  return (
    <div className="space-y-3">
      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Group - Tone, Length & Word Count */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Tone Dropdown */}
          <div className="relative flex-1 sm:flex-none min-w-[120px] sm:min-w-[140px]">
            <button
              onClick={() => setIsToneOpen(!isToneOpen)}
              className={`
                flex items-center justify-between w-full px-3 py-1.5 border-2 transition-all duration-200 text-[10px] font-mono font-bold rounded-lg cursor-pointer 
                ${
                  isToneOpen
                    ? 'border-wharf-border-primary shadow-brutal-sm'
                    : 'border-wharf-border-secondary hover:border-wharf-border-primary'
                }
              `}
            >
              <div className="flex items-center gap-1.5 truncate">
                <SelectedToneIcon className={`w-3.5 h-3.5 flex-shrink-0 ${getSelectedTone().color}`} />
                <span className="text-wharf-text-primary truncate">{getSelectedTone().label}</span>
              </div>
              <ChevronDown
                className={`w-3 h-3 text-wharf-text-tertiary transition-transform flex-shrink-0 ${isToneOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isToneOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsToneOpen(false)} />
                <div className="absolute top-full left-0 mt-1 w-full z-20 border-2 border-wharf-border-primary bg-wharf-surface-primary shadow-brutal-sm">
                  {bioTones.map((tone) => {
                    const isActive = selectedTone === tone.id;
                    const Icon = tone.icon;
                    return (
                      <button
                        key={tone.id}
                        onClick={() => {
                          setSelectedTone(tone.id);
                          setIsToneOpen(false);
                        }}
                        className={`
                          flex items-center gap-2 w-full px-3 py-2 text-[10px] font-mono font-bold transition-colors
                          ${
                            isActive
                              ? `${tone.color} bg-wharf-surface-secondary`
                              : 'hover:bg-wharf-surface-secondary text-wharf-text-secondary'
                          }
                        `}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? tone.color : 'text-wharf-text-tertiary'}`}
                        />
                        <span
                          className={
                            isActive ? 'text-wharf-text-primary' : 'text-wharf-text-secondary'
                          }
                        >
                          {tone.label}
                        </span>
                        {isActive && <Check className="w-3 h-3 ml-auto text-wharf-green-dark flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Length Dropdown */}
          <div className="relative flex-1 sm:flex-none min-w-[100px] sm:min-w-[110px]">
            <button
              onClick={() => setIsLengthOpen(!isLengthOpen)}
              className={`
                flex items-center justify-between w-full px-3 py-1.5 border-2 transition-all duration-200 text-[10px] font-mono font-bold rounded-lg cursor-pointer
                ${
                  isLengthOpen
                    ? 'border-wharf-border-primary shadow-brutal-sm'
                    : 'border-wharf-border-secondary hover:border-wharf-border-primary'
                }
              `}
            >
              <span className="text-wharf-text-primary truncate">{getSelectedLength().label}</span>
              <ChevronDown
                className={`w-3 h-3 text-wharf-text-tertiary transition-transform flex-shrink-0 ${isLengthOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isLengthOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsLengthOpen(false)} />
                <div className="absolute top-full left-0 mt-1 w-full z-20 border-2 border-wharf-border-primary bg-wharf-surface-primary shadow-brutal-sm">
                  {bioLengths.map((length) => {
                    const isActive = selectedLength === length.id;
                    return (
                      <button
                        key={length.id}
                        onClick={() => {
                          setSelectedLength(length.id);
                          setIsLengthOpen(false);
                        }}
                        className={`
                          flex items-center justify-between w-full px-3 py-2 text-[10px] font-mono font-bold transition-colors
                          ${
                            isActive
                              ? 'bg-wharf-surface-secondary text-wharf-text-primary'
                              : 'hover:bg-wharf-surface-secondary text-wharf-text-secondary'
                          }
                        `}
                      >
                        <span
                          className={
                            isActive ? 'text-wharf-text-primary' : 'text-wharf-text-secondary'
                          }
                        >
                          {length.label}
                        </span>
                        {isActive && <Check className="w-3 h-3 text-wharf-green-dark flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <span className="hidden sm:block w-px h-5 bg-wharf-border-secondary" />

          {/* Word Count */}
          <span className="hidden sm:flex font-mono text-[10px] text-wharf-text-secondary items-center gap-1">
            <Type className="w-3 h-3 text-wharf-text-tertiary" />
            {getWordCount(bio)} words
          </span>
        </div>

        {/* Right Group - Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-start">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`
                p-1.5 border-2 transition-all duration-200 cursor-pointer rounded-md flex-shrink-0
                ${
                  isEditing
                    ? 'border-wharf-yellow bg-wharf-yellow/10'
                    : 'border-wharf-border-primary hover:border-wharf-yellow hover:bg-wharf-yellow/50'
                }
              `}
              title={isEditing ? 'Save changes' : 'Edit bio'}
            >
              {isEditing ? (
                <Check className="w-3.5 h-3.5 text-wharf-yellow-dark" />
              ) : (
                <Edit2 className="w-3.5 h-3.5 text-wharf-text-secondary" />
              )}
            </button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="text-[10px] font-mono font-bold gap-1 text-wharf-text-primary whitespace-nowrap flex-shrink-0"
            >
              {isGenerating ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
              <span className="hidden xs:inline">{isGenerating ? 'Generating...' : 'AI Generate'}</span>
              <span className="xs:hidden">{isGenerating ? '...' : 'AI Generate'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bio Display/Edit */}
      {isEditing ? (
        <div className="space-y-2">
          <div className="relative">
            <Input
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="text-sm font-mono pr-16 min-h-[60px] resize-y text-wharf-text-primary rounded-lg"
              placeholder="Write your bio..."
              autoFocus
            />
            <span
              className={`absolute bottom-2 right-2 font-mono text-[9px] ${
                editBio.length > 400 ? 'text-wharf-error' : 'text-wharf-text-tertiary'
              }`}
            >
              {editBio.length}/400
            </span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1 px-2 py-1 border border-wharf-border-secondary hover:border-wharf-error transition-colors font-mono text-[10px] rounded-md text-wharf-text-secondary"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1 px-2 py-1 border border-wharf-border-primary bg-wharf-yellow hover:bg-wharf-yellow/90 transition-colors font-mono text-[10px] rounded-md font-bold text-wharf-black"
            >
              <Check className="w-3 h-3" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`
          p-3 border-2 transition-all duration-200 rounded-lg
          ${
            bio
              ? 'border-wharf-border-secondary bg-wharf-surface-secondary/30 hover:border-wharf-border-primary'
              : 'border-dashed border-wharf-border-secondary bg-wharf-surface-secondary/50'
          }
        `}
        >
          <p
            className={`font-mono text-sm leading-relaxed ${
              bio ? 'text-wharf-text-primary' : 'text-wharf-text-tertiary italic'
            }`}
          >
            {bio || 'No bio set. Click AI Generate or the edit button to add one.'}
          </p>
        </div>
      )}
    </div>
  );
};