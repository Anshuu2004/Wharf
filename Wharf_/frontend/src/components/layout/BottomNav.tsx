import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  FileText,
  Activity,
  Settings,
  GitBranch,
  BarChart3,
} from "lucide-react";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavItemData {
  id: string;
  icon: React.ElementType;
  label: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const navItems: NavItemData[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'generator', icon: FileText, label: 'Generator' },
    { id: 'treemap', icon: GitBranch, label: 'Tree Map' },
    { id: 'health', icon: Activity, label: 'Health' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:block">
      <div className="flex items-center gap-5 px-5 py-2.5 bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal">
        {navItems.map((item, index) => (
          <NavItem 
            key={item.id} 
            item={item} 
            index={index}
            isHovered={hoveredIndex === index}
            isActive={currentPage === item.id}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>
    </nav>
  );
};

function NavItem({ 
  item,
  isHovered,
  isActive,
  onHoverStart,
  onHoverEnd,
  onClick 
}: { 
  item: NavItemData;
  index: number;
  isHovered: boolean;
  isActive: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}) {
  const Icon = item.icon;

  // Animation Variants
  const iconVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.35, y: -8 },
    active: { scale: 1, y: 0 }
  };

  const selectedVariant = isActive ? 'active' : isHovered ? 'hover' : 'idle';

  return (
    <button
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={`
        group relative flex flex-col items-center justify-center
        w-11 h-11 transition-colors duration-200 cursor-pointer
        ${isActive 
          ? 'bg-wharf-pink border-2 border-wharf-border-primary' 
          : 'hover:bg-wharf-surface-secondary border-2 border-transparent'
        }
      `}
    >
      {/* Tooltip Label */}
      <span className="
        absolute -top-11 px-2 py-0.5 
        bg-wharf-black text-wharf-white 
        text-[10px] font-bold 
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-200 
        whitespace-nowrap 
        border border-wharf-border-primary 
        shadow-brutal-sm
        pointer-events-none
        z-50
      ">
        {item.label}
      </span>

      {/* Icon with Animation */}
      <motion.div 
        variants={iconVariants}
        animate={selectedVariant}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="flex items-center justify-center"
      >
        <Icon 
          className={`
            w-6 h-6 transition-all duration-200
            ${isActive
              ? 'text-wharf-black stroke-[2.5px]' 
              : 'text-wharf-text-secondary group-hover:text-wharf-text-primary'
            }
          `} 
        />
      </motion.div>
      
      {/* Active Indicator */}
      {isActive && (
        <motion.div 
          layoutId="active-pill"
          transition={{ type: "spring", stiffness: 600, damping: 40 }}
          className="absolute bottom-1.5 w-2 h-0.5 bg-wharf-black"
        />
      )}
    </button>
  );
}

export default BottomNav;