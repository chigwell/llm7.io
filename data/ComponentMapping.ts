import Installation from "@/components/Installation";
import Introduction from "@/components/Introduction";
import StoryBehind from "@/components/StoryBehind";
import Changelog from "@/components/ChangeLog";
import TextDecryptionShowcase, {
  TextDecryptionTheme,
} from "@/components/vui/text/TextDecryption";
import CountUpShowcase, { CountUpTheme } from "@/components/vui/text/CountUp";
import {
  TypingTextShowcase,
  TypingTextTheme,
} from "@/components/vui/text/TypingText";
import { AccordionShowcase, AccordionTheme } from "@/components/vui/Accordion";
import {
  WheelPickerDemo,
  WheelPickerTheme,
} from "@/components/vui/WheelPicker";
import { SkeletonShowcase, SkeletonTheme } from "@/components/vui/Skeleton";
import {
  CheckboxRefinedShowcase,
  CheckboxRefinedTheme,
} from "@/components/vui/CheckboxUpgraded";
import SheetShowcase from "@/components/vui/Sheet";
import {
  AnimatedNumberCountdownShowcase,
  AnimatedNumberCountdownTheme,
} from "@/components/vui/text/AnimatedNumber";
import { BentoGridShowcase, BentoGridTheme } from "@/components/vui/BentoGrid";
import CardShowcase, { CardTheme } from "@/components/vui/Card";
import TunnelShowcase from "@/components/vui/backgrounds/Tunnel";
import {
  WavyTilesShowcase,
  WavyTilesTheme,
} from "@/components/vui/backgrounds/WavyTiles";
import HexagonalShowcase from "@/components/vui/backgrounds/Hexagonal";
import { ButtonShowcase, ButtonTheme } from "@/components/vui/Button";
import ToolTipShowcase, { ToolTipTheme } from "@/components/vui/ToolTip";
import NavigationShowcase from "@/components/vui/Navigation";
import { PillShowcase, PillTheme } from "@/components/vui/pillcomponent";
import MagicalChatInput from "@/components/vui/ai/MagicalChatInput";
import {
  WavingTextShowcase,
  WavingTextTheme,
} from "@/components/vui/text/WavingText";
import BeautifulFooterShowcase from "@/components/vui/BeautyFooter";
import MagicalCaret from "@/components/vui/MagicalCaret";
import FlipTextShowcase, { FlipTextTheme } from "@/components/vui/text/FlipText";
import DrawingLinesShowcase from "@/components/vui/backgrounds/DrawingLines";

export type ComponentEntry = {
  name: string;
  component: React.ComponentType;
  theme?: React.ComponentType;
  route: string;
  path: string | undefined;
  description: string;
};

export type ComponentCategoryMap = {
  [category: string]: ComponentEntry[];
};

export const componentMap: ComponentCategoryMap = {
  "Get Started": [
    {
      name: "Introduction",
      component: Introduction,
      route: "/get-started/introduction",
      path: undefined,
      description:
        "🚀 <b>Welcome to VUI</b> - A modern React UI library designed for developers who value <b>beautiful design</b> and <b>seamless functionality</b>. Get started with our comprehensive guide.",
    },
    {
      name: "Installation",
      component: Installation,
      route: "/get-started/installation",
      path: undefined,
      description:
        "⚡ <b>Quick Setup Guide</b> - Install VUI in your project with <code>npm</code>, <code>yarn</code>, or <code>pnpm</code>. Includes <b>TypeScript support</b> and <b>tree-shaking</b> for optimal bundle size.",
    },
    {
      name: "Story Behind",
      component: StoryBehind,
      route: "/get-started/story-behind",
      path: undefined,
      description:
        "💡 <b>The Journey</b> - Discover the inspiration and vision behind VUI. Learn about our commitment to <b>developer experience</b> and <b>design excellence</b>.",
    },
    {
      name: "Changelog",
      component: Changelog,
      route: "/get-started/changelog",
      path: undefined,
      description:
        "📝 <b>Release Notes</b> - Stay updated with the latest features, improvements, and bug fixes. Track our progress with <b>semantic versioning</b> and detailed change logs.",
    },
  ],
  "AI Components": [
    {
      name: "Magical Chat Input",
      component: MagicalChatInput,
      route: "/ai-components/magical-chat-input",
      path: "components/vui/ai/MagicalChatInput.tsx",
      description:
        "🔮 <b>Magical Chat Input</b> - A magical chat input component with <span style='color: #8b5cf6;'>smooth animations</span>, <span style='color: #3b82f6;'>cursor effects</span>, and <span style='color: #10b981;'>micro-interactions</span>. <i>Perfect for chat applications and AI assistants.</i>",
    },
  ],
  Backgrounds: [
    {
      name: "Hexagonal",
      component: HexagonalShowcase,
      route: "/backgrounds/hexagonal",
      path: "components/vui/backgrounds/Hexagonal.tsx",
      description:
        "🌐 <b>Hexagonal Background</b> - A beautiful hexagonal background with <span style='color: #8b5cf6;'>smooth transitions</span> and <span style='color: #3b82f6;'>customizable colors</span>. <i>Perfect for portfolios and creative websites.</i>",
    },
    {
      name: "Tunnel",
      component: TunnelShowcase,
      route: "/backgrounds/tunnel",
      path: "components/vui/backgrounds/Tunnel.tsx",
      description:
        "🌌 <b>3D Tunnel Animation</b> - Mesmerizing <span style='color: #8b5cf6;'>depth-based</span> background effect with <span style='color: #3b82f6;'>particle systems</span> and <span style='color: #10b981;'>smooth transitions</span>. <i>Creates an immersive visual experience for hero sections.</i>",
    },
    {
      name:"Drawing Lines",
      component:DrawingLinesShowcase,
      route:"/backgrounds/drawing-lines",
      path:"components/vui/backgrounds/DrawingLines.tsx",
      description:"🎨 <b>Drawing Lines</b> - A beautiful drawing lines background with <span style='color: #8b5cf6;'>smooth transitions</span> and <span style='color: #3b82f6;'>customizable colors</span>. <i>Perfect for portfolios and creative websites.</i>",
    },
    {
      name: "Wavy Tiles",
      component: WavyTilesShowcase,
      route: "/backgrounds/wavy-tiles",
      path: "components/vui/backgrounds/WavyTiles.tsx",
      description:
        "🌊 <b>Animated Wave Pattern</b> - Dynamic tiled background with <span style='color: #3b82f6;'>fluid wave animations</span> and <span style='color: #f59e0b;'>customizable colors</span>. Features <span style='color: #10b981;'>performance optimization</span> and <b>responsive scaling</b>.",
    },
  ],
  Components: [
    {
      name: "Accordion",
      component: AccordionShowcase,
      theme: AccordionTheme,
      route: "/components/accordion",
      path: "components/vui/Accordion.tsx",
      description:
        "📁 <b>Collapsible Content Panels</b> - Organize content with smooth <span style='color: #8b5cf6;'>expand/collapse animations</span>. Supports <span style='color: #10b981;'>multiple open items</span>, keyboard navigation, and <b>accessibility features</b>.",
    },
    {
      name: "Bento Grid",
      component: BentoGridShowcase,
      theme: BentoGridTheme,
      route: "/components/bento-grid",
      path: "components/vui/BentoGrid.tsx",
      description:
        "🎨 <b>Modern Grid Layout</b> - Create beautiful <span style='color: #f59e0b;'>masonry-style</span> layouts inspired by Apple's design language. Features <span style='color: #3b82f6;'>responsive breakpoints</span> and <span style='color: #8b5cf6;'>smooth hover effects</span>.",
    },
    {
      name: "Buttons",
      component: ButtonShowcase,
      theme: ButtonTheme,
      route: "/components/buttons",
      path: "components/vui/Button.tsx",
      description:
        "🎭 <b>Interactive Button Collection</b> - A comprehensive set of buttons including <span style='color: #ef4444;'>Shimmer</span>, <span style='color: #8b5cf6;'>Magnetic</span>, <span style='color: #f59e0b;'>Spotlight</span>, and <span style='color: #10b981;'>Video</span> variants with <b>micro-interactions</b> and <b>haptic feedback</b>.",
    },
    {
      name: "Card",
      component: CardShowcase,
      theme: CardTheme,
      route: "/components/card",
      path: "components/vui/Card.tsx",
      description:
        "🃏 <b>Elegant Content Cards</b> - Display content in beautiful cards with <span style='color: #3b82f6;'>glassmorphism effects</span>, <span style='color: #8b5cf6;'>hover animations</span>, and <span style='color: #10b981;'>responsive layouts</span>. <i>Perfect for portfolios and dashboards.</i>",
    },
    {
      name: "Checkbox",
      component: CheckboxRefinedShowcase,
      theme: CheckboxRefinedTheme,
      route: "/components/checkbox",
      path: "components/vui/CheckboxUpgraded.tsx",
      description:
        "✅ <b>Enhanced Checkbox Controls</b> - Beautifully animated checkboxes with <span style='color: #10b981;'>smooth transitions</span>, <span style='color: #f59e0b;'>indeterminate states</span>, and <span style='color: #8b5cf6;'>custom styling options</span>. Fully accessible and keyboard-friendly.",
    },
    {
      name: "Footer",
      component: BeautifulFooterShowcase,
      route: "/components/footer",
      path: "components/vui/BeautyFooter.tsx",
      description:
        "👣 <b>Beautiful Footer</b> - Create stunning footer sections with <span style='color: #8b5cf6;'>multi-layered gradients</span>, <span style='color: #3b82f6;'>glassmorphism effects</span>, and <span style='color: #f59e0b;'>artistic light overlays</span>. Features <span style='color: #10b981;'>responsive design</span> and <b>smooth hover animations</b>. <i>Perfect for portfolios, agencies, and creative websites.</i>",
    },
    {
      name: "Magical Caret",
      component: MagicalCaret,
      route: "/components/magical-caret",
      path: "components/vui/MagicalCaret.tsx",
      description:
        "🔮 <b>Magical Caret</b> - A magical caret component with <span style='color: #8b5cf6;'>smooth animations</span>, <span style='color: #3b82f6;'>cursor effects</span>, and <span style='color: #10b981;'>micro-interactions</span>. <i>Perfect for chat applications and AI assistants.</i>",
    },
    {
      name: "Navigation",
      component: NavigationShowcase,
      route: "/components/navigation",
      path: "components/vui/Navigation.tsx",
      description:
        "🧭 <b>Responsive Navigation System</b> - Modern navigation components with <span style='color: #3b82f6;'>smooth transitions</span>, <span style='color: #10b981;'>mobile-first design</span>, and <span style='color: #8b5cf6;'>active state indicators</span>. <i>Includes breadcrumbs and menu variants.</i>",
    },
    {
      name: "Pill",
      component: PillShowcase,
      theme: PillTheme,
      route: "/components/pill",
      path: "components/vui/pillcomponent.tsx",
      description:
        "💊 <b>Pill / Tag Component</b> - Versatile labels and status indicators with <span style='color: #3b82f6;'>variants</span>, <span style='color: #8b5cf6;'>sizes</span>, and <span style='color: #10b981;'>icons</span>. Ideal for tagging, chips, and dynamic metadata.",
    },
    {
      name: "Sheet",
      component: SheetShowcase,
      route: "/components/sheet",
      path: "components/vui/Sheet.tsx",
      description:
        "📄 <b>Sliding Panel Component</b> - Create smooth slide-out panels from any direction with <span style='color: #3b82f6;'>backdrop blur</span>, <span style='color: #ef4444;'>drag-to-close</span>, and <span style='color: #10b981;'>responsive breakpoints</span>. <i>Perfect for mobile interfaces.</i>",
    },
    {
      name: "Skeleton",
      component: SkeletonShowcase,
      theme: SkeletonTheme,
      route: "/components/skeleton",
      path: "components/vui/Skeleton.tsx",
      description:
        "💀 <b>Loading State Placeholders</b> - Improve perceived performance with <span style='color: #8b5cf6;'>shimmer animations</span> and <span style='color: #f59e0b;'>customizable shapes</span>. Supports <span style='color: #10b981;'>dark/light themes</span> and <b>complex layouts</b>.",
    },
    {
      name: "Tooltip",
      component: ToolTipShowcase,
      theme: ToolTipTheme,
      route: "/components/tooltip",
      path: "components/vui/ToolTip.tsx",
      description:
        "💬 <b>Smart Tooltip System</b> - Context-aware tooltips with <span style='color: #3b82f6;'>auto-positioning</span>, <span style='color: #10b981;'>arrow indicators</span>, and <span style='color: #f59e0b;'>delay controls</span>. Includes <b>rich content support</b> and <b>accessibility features</b>.",
    },
    {
      name: "Wheel Picker",
      component: WheelPickerDemo,
      theme: WheelPickerTheme,
      route: "/components/wheel-picker",
      path: "components/vui/WheelPicker.tsx",
      description:
        "🎡 <b>iOS-Style Picker Wheel</b> - Native-feeling selection component with <span style='color: #8b5cf6;'>momentum scrolling</span>, <span style='color: #ef4444;'>haptic feedback</span>, and <span style='color: #10b981;'>infinite scroll support</span>. <i>Great for date/time and option selection.</i> <br /><br /> Credits to <a href='https://www.chanhdai.com' target='_blank'>@ncdai</a> for creating this beautiful iOS Wheel Picker. ",
    },
  ],
  "Text Animation": [
    {
      name: "Animated Number",
      component: AnimatedNumberCountdownShowcase,
      theme: AnimatedNumberCountdownTheme,
      route: "/text-animation/animated-number",
      path: "components/vui/text/AnimatedNumber.tsx",
      description:
        "🔢 <b>Dynamic Number Animations</b> - Create stunning countdown timers and number transitions with <span style='color: #3b82f6;'>smooth easing</span> and customizable <span style='color: #8b5cf6;'>duration</span>. <i>Perfect for dashboards and analytics.</i>",
    },
    {
      name: "Counting Number",
      component: CountUpShowcase,
      theme: CountUpTheme,
      route: "/text-animation/counting-number",
      path: "components/vui/text/CountUp.tsx",
      description:
        "📈 <b>Count-Up Animations</b> - Animate numbers from zero to target values with <span style='color: #10b981;'>configurable speed</span> and <span style='color: #f59e0b;'>decimal precision</span>. <i>Ideal for displaying statistics and metrics.</i>",
    },
    {
      name: "Decryption Text",
      component: TextDecryptionShowcase,
      theme: TextDecryptionTheme,
      route: "/text-animation/decryption-text",
      path: "components/vui/text/TextDecryption.tsx",
      description:
        "🔐 <b>Matrix-Style Text Reveal</b> - Create captivating text animations that simulate <span style='color: #ef4444;'>decryption effects</span>. Features <span style='color: #8b5cf6;'>character scrambling</span> and smooth reveal transitions.",
    },
    {
      name:"Flipping Text",
      component:FlipTextShowcase,
      theme:FlipTextTheme,
      route:"/text-animation/flipping-text",
      path:"components/vui/text/FlipText.tsx",
      description:"🔄 <b>Flipping Text Effect</b> - Create mesmerizing text animations with <span style='color: #3b82f6;'>smooth flip effects</span>. Features <span style='color: #10b981;'>configurable speed</span> and <span style='color: #f59e0b;'>customizable colors</span>.",
    },
    {
      name: "Typing Text",
      component: TypingTextShowcase,
      theme: TypingTextTheme,
      route: "/text-animation/typing-text",
      path: "components/vui/text/TypingText.tsx",
      description:
        "⌨️ <b>Typewriter Effect</b> - Simulate realistic typing animations with <span style='color: #3b82f6;'>customizable speed</span>, <span style='color: #10b981;'>cursor blinking</span>, and <span style='color: #f59e0b;'>backspace effects</span>. <i>Great for hero sections and presentations.</i>",
    },
    {
      name: "Waving Text",
      component: WavingTextShowcase,
      theme: WavingTextTheme,
      route: "/text-animation/waving-text",
      path: "components/vui/text/WavingText.tsx",
      description:
        "🌊 <b>Waving Text Effect</b> - Create mesmerizing text animations with <span style='color: #3b82f6;'>smooth wave effects</span>. Features <span style='color: #10b981;'>configurable speed</span> and <span style='color: #f59e0b;'>customizable colors</span>.",
    },
  ],
};
