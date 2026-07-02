import { Lightbulb, ArrowRight } from 'lucide-react';

interface SuggestedFollowupsProps {
  suggestions: string[];
  onSelect: (prompt: string) => void;
}

export const SuggestedFollowups = ({ suggestions, onSelect }: SuggestedFollowupsProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-3.5 h-3.5 text-wharf-yellow" />
        <span className="font-mono text-xs text-wharf-text-secondary capitalize">Suggested follow-ups</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            className="flex items-center gap-1 px-3 py-1.5 border border-wharf-border-secondary hover:border-wharf-pink hover:bg-wharf-pink/5 transition-colors group"
          >
            <span className="font-mono text-xs">{suggestion}</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
};
