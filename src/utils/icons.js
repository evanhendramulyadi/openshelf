import {
  createIcons,
  BookOpen,
  BookMarked,
  Bookmark,
  Heart,
  Download,
  Search,
  Compass,
  Library,
  Grid,
  List,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Moon,
  Sun,
  Share2,
  Info,
  Sparkles,
  Clock,
  Flame,
  SlidersHorizontal,
  Trash2,
  Filter,
  RotateCcw,
  Maximize2,
  Minimize2,
  Type,
  FileText,
  BookCheck,
  HelpCircle,
  Menu,
  Eye,
  Globe,
  Tag,
  Layers,
  ArrowUpRight,
  RefreshCw
} from 'lucide';

// Icon mapping registry
export const ICONS = {
  BookOpen,
  BookMarked,
  Bookmark,
  Heart,
  Download,
  Search,
  Compass,
  Library,
  Grid,
  List,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Moon,
  Sun,
  Share2,
  Info,
  Sparkles,
  Clock,
  Flame,
  SlidersHorizontal,
  Trash2,
  Filter,
  RotateCcw,
  Maximize2,
  Minimize2,
  Type,
  FileText,
  BookCheck,
  HelpCircle,
  Menu,
  Eye,
  Globe,
  Tag,
  Layers,
  ArrowUpRight,
  RefreshCw
};

/**
 * Initializes/hydrates Lucide icons inside a container or the entire document
 * @param {HTMLElement|Document} root 
 */
export function initIcons(root = document) {
  try {
    createIcons({
      icons: ICONS,
      attrs: {
        'stroke-width': 2,
      },
      nameAttr: 'data-lucide',
      root: root
    });
  } catch (error) {
    console.error('Error hydrating Lucide icons:', error);
  }
}

/**
 * Helper to render an icon placeholder tag
 * @param {string} name - kebab-case name (e.g. 'book-open', 'search')
 * @param {string} className 
 * @param {string} extraAttrs 
 * @returns {string} HTML string
 */
export function renderIcon(name, className = 'w-4 h-4', extraAttrs = '') {
  return `<i data-lucide="${name}" class="${className} inline-block align-middle" ${extraAttrs}></i>`;
}

