// Industrial-style line icons
type IconProps = {
  name: string;
  size?: number;
  stroke?: number;
};

export function Icon({ name, size = 24, stroke = 1.5 }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'square' as const,
    strokeLinejoin: 'miter' as const,
  };
  switch (name) {
    case 'crane':
      return (
        <svg {...props}>
          <path d="M3 21h18M5 21V7l14-2v4M5 7l14 8M9 21v-6h4v6M19 9v6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case 'forklift':
      return (
        <svg {...props}>
          <path d="M3 17V8h7l3 4h5v5M3 17h13M19 17h2" />
          <circle cx="7" cy="19" r="2" />
          <circle cx="17" cy="19" r="2" />
          <path d="M21 17V6M21 6l-3 3M21 6l3 3" transform="translate(-3 0)" />
        </svg>
      );
    case 'lift':
      return (
        <svg {...props}>
          <path d="M4 21h16M6 21v-4h12v4M9 17l3-12 3 12M12 5V3" />
          <path d="M3 13h2M19 13h2" />
        </svg>
      );
    case 'excavator':
      return (
        <svg {...props}>
          <path d="M2 20h20M4 20v-3h12v3M16 17l-2-5h-3l-2 5M14 12l4-5 3 2-2 4M18 7V4" />
          <circle cx="6" cy="18" r="1.5" />
          <circle cx="14" cy="18" r="1.5" />
        </svg>
      );
    case 'bulldozer':
      return (
        <svg {...props}>
          <path d="M2 20h20M4 20v-3h14v3M5 17l2-5h7v5M14 12V8h5v4M3 14v6" />
          <circle cx="7" cy="19" r="1.5" />
          <circle cx="13" cy="19" r="1.5" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 3l8 3v6c0 4-3 7-8 9-5-2-8-5-8-9V6l8-3zM9 12l2 2 4-4" />
        </svg>
      );
    case 'operator':
      return (
        <svg {...props}>
          <circle cx="12" cy="7" r="3" />
          <path d="M5 21v-3c0-3 3-5 7-5s7 2 7 5v3" />
        </svg>
      );
    case 'tag':
      return (
        <svg {...props}>
          <path d="M3 12V3h9l9 9-9 9-9-9z" />
          <circle cx="8" cy="8" r="1.5" />
        </svg>
      );
    case 'map':
      return (
        <svg {...props}>
          <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2zM9 3v16M15 5v16" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...props}>
          <path d="M5 4h4l2 5-3 2c1 3 3 5 6 6l2-3 5 2v4c0 1-1 2-2 2C9 22 2 15 2 6c0-1 1-2 2-2h1z" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" />
          <path d="M3 5l9 7 9-7" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...props}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case 'arrow-up-right':
      return (
        <svg {...props}>
          <path d="M7 17L17 7M7 7h10v10" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <path d="M5 12l4 4L19 6" />
        </svg>
      );
    case 'tools':
      return (
        <svg {...props}>
          <path d="M14 6l4 4-8 8H6v-4l8-8zM14 6l3-3 4 4-3 3" />
        </svg>
      );
    case 'truck':
      return (
        <svg {...props}>
          <rect x="2" y="7" width="11" height="10" />
          <path d="M13 10h5l3 4v3h-8M6 21a2 2 0 100-4 2 2 0 000 4zM18 21a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      );
    case 'lightning':
      return (
        <svg {...props}>
          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...props}>
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      );
    case 'close':
      return (
        <svg {...props}>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...props}>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      );
    default:
      return null;
  }
}
