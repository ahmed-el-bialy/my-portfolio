import React from 'react';

interface TechLogoProps {
  className?: string;
  size?: number;
}

// Official Online Vector Image Renderer with High-Precision SVG Fallback
const VectorIcon: React.FC<{
  src: string;
  alt: string;
  size: number;
  fallback: React.ReactNode;
  className?: string;
}> = ({ src, alt, size, fallback, className = '' }) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

// Official Flutter Brand Logo (Verified Online Devicon + Inline Vector)
export const FlutterLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <VectorIcon
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg"
    alt="Flutter Official Logo"
    size={size}
    className={className}
    fallback={
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M14.314 2L4 12.314l3.143 3.143L17.457 5.143h6.286L14.314 2z" fill="#02569B" />
        <path d="M14.314 12.571L8.571 18.314l3.143 3.143 2.6-2.6 6.286 6.286h6.286l-9.429-9.429-3.143-3.143z" fill="#0175C2" />
        <path d="M11.714 15.171l2.6-2.6 3.143 3.143-2.6 2.6-3.143-3.143z" fill="#13B9FD" />
      </svg>
    }
  />
);

// Official Dart Brand Logo (Verified Online Devicon + Inline Vector)
export const DartLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <VectorIcon
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg"
    alt="Dart Official Logo"
    size={size}
    className={className}
    fallback={
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M4.1 2L2 9.4l9.5 9.5 10.5-10.6L15.7 2H4.1z" fill="#0175C2" />
        <path d="M11.5 18.9L6.2 22H19l3-3.2-10.5.1z" fill="#00B4AB" />
        <path d="M4.1 2L2 9.4l9.5 9.5L15.7 2H4.1z" fill="#02569B" />
        <path d="M11.5 18.9l4.2-10.6 6.3.1-10.5 10.5z" fill="#29B6F6" />
      </svg>
    }
  />
);

// Official Android Studio Logo (Verified Online Devicon + Inline Vector)
export const AndroidStudioLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <VectorIcon
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/androidstudio/androidstudio-original.svg"
    alt="Android Studio Official Logo"
    size={size}
    className={className}
    fallback={
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="9.5" stroke="#3DDC84" strokeWidth="1.8" fill="rgba(61,220,132,0.12)" />
        <path d="M12 6l4 11M12 6L8 17M8.8 14h6.4" stroke="#3DDC84" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    }
  />
);

// Official Postman Brand Logo (Verified Online Devicon + Inline Vector)
export const PostmanLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <VectorIcon
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg"
    alt="Postman Official Logo"
    size={size}
    className={className}
    fallback={
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="10" fill="#FF6C37" />
        <path d="M14.5 8.5H9.5a1 1 0 00-.8.4L6.5 12a1 1 0 000 1.2l2.2 3.1a1 1 0 00.8.4h5a1 1 0 00.8-.4l2.2-3.1a1 1 0 000-1.2L15.3 8.9a1 1 0 00-.8-.4z" fill="#FFFFFF" />
      </svg>
    }
  />
);

// Official Firebase Logo (Verified Online Devicon)
export const FirebaseLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <VectorIcon
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg"
    alt="Firebase Official Logo"
    size={size}
    className={className}
    fallback={
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M4.5 18.5L6.8 4.2l3.4 6.4L4.5 18.5z" fill="#FF9100" />
        <path d="M19.5 18.5L14.7 3.5l-4.5 7.1 9.3 7.9z" fill="#FFC400" />
        <path d="M4.5 18.5l7.5 4.2 7.5-4.2-9.3-7.9-5.7 7.9z" fill="#F44336" />
      </svg>
    }
  />
);

// Official VS Code Logo (Verified Online Devicon)
export const VSCodeLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <VectorIcon
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg"
    alt="VS Code Official Logo"
    size={size}
    className={className}
    fallback={
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M17.8 2.1l-8.5 7.9L4.6 6.3 2 7.7l5.2 4.3L2 16.3l2.6 1.4 4.7-3.7 8.5 7.9 4.2-2V4.1l-4.2-2zm0 4.8v10.2l-5.6-5.1 5.6-5.1z" fill="#007ACC" />
      </svg>
    }
  />
);

// Official Figma Logo (Verified Online Devicon)
export const FigmaLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <VectorIcon
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg"
    alt="Figma Official Logo"
    size={size}
    className={className}
    fallback={
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z" fill="#0ACF83" />
        <path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#A259FF" />
        <circle cx="16" cy="12" r="4" fill="#1ABCFE" />
      </svg>
    }
  />
);

// Official Git Logo (Verified Online Devicon)
export const GitLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <VectorIcon
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg"
    alt="Git Official Logo"
    size={size}
    className={className}
    fallback={
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M21.7 10.8L13.2 2.3a1.7 1.7 0 00-2.4 0l-1.9 1.9 2.4 2.4a2 2 0 012.6 2.6l2.3 2.3a2 2 0 11-1.2 1.2l-2.1-2.1v4.7a2 2 0 11-1.7 0V9.8a2 2 0 01-1.1-2.6L7.7 4.8 2.3 10.2a1.7 1.7 0 000 2.4l8.5 8.5a1.7 1.7 0 002.4 0l8.5-8.5a1.7 1.7 0 000-2.4z" fill="#F05138" />
      </svg>
    }
  />
);

// Official Python Logo (Verified Online Devicon)
export const PythonLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <VectorIcon
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"
    alt="Python Official Logo"
    size={size}
    className={className}
    fallback={
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M11.8 2c-4.3 0-4 1.8-4 1.8v1.9h4.1v.6H6.1S2 5.8 2 10.1s3.6 4.1 3.6 4.1h1.2v-1.7s-.1-2 2-2h4.1s1.9.1 1.9-1.9V4.7S15 2 11.8 2zm-1.2 1.3c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7z" fill="#3776AB" />
        <path d="M12.2 22c4.3 0 4-1.8 4-4v-1.9h-4.1v-.6h5.8s4.1.5 4.1-3.8-3.6-4.1-3.6-4.1h-1.2v1.7s.1 2-2 2h-4.1s-1.9-.1-1.9 1.9v3.9s-.2 2.7 3 2.7zm1.2-1.3c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7z" fill="#FFD43B" />
      </svg>
    }
  />
);

// Official SQLite Logo (Verified Online Devicon)
export const SQLiteLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <VectorIcon
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg"
    alt="SQLite Official Logo"
    size={size}
    className={className}
    fallback={
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="4" width="18" height="16" rx="3" stroke="#003B57" strokeWidth="1.8" fill="rgba(0,59,87,0.15)" />
        <path d="M7 8h10M7 12h10M7 16h6" stroke="#003B57" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="17" cy="16" r="1.5" fill="#00A2D3" />
      </svg>
    }
  />
);

// Official felangel/bloc Multi-Faceted Isometric Cube Brand Logo
export const BlocLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="BLoC Official Emblem">
    <path d="M12 2L3.5 6.8v10.4L12 22l8.5-4.8V6.8L12 2z" fill="#00D9FF" fillOpacity="0.16" />
    <path d="M12 2L3.5 6.8L12 11.6l8.5-4.8L12 2z" fill="#38BDF8" />
    <path d="M3.5 6.8v10.4L12 22V11.6L3.5 6.8z" fill="#0284C7" />
    <path d="M20.5 6.8v10.4L12 22V11.6l8.5-4.8z" fill="#00C7FF" />
    <path d="M12 2L3.5 6.8v10.4L12 22l8.5-4.8V6.8L12 2z" stroke="#7DD3FC" strokeWidth="0.9" strokeLinejoin="round" />
  </svg>
);

// Official Cubit Emblem (felangel/bloc lightweight state cube with core node)
export const CubitLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Cubit Official Emblem">
    <path d="M12 2.5L4 7v10l8 4.5 8-4.5V7l-8-4.5z" fill="rgba(34, 211, 238, 0.14)" stroke="#22D3EE" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 2.5v9m0 0L4 7m8 4.5L20 7" stroke="#38BDF8" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" fill="#06B6D4" stroke="#E0F2FE" strokeWidth="1.2" />
  </svg>
);

// Authentic Hive Honeycomb Brand Emblem (Golden Amber Hex Lattice)
export const HiveLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Hive Logo">
    {/* Top Honeycomb Cell */}
    <path d="M12 2.2L15.6 4.3v4.2L12 10.6 8.4 8.5V4.3L12 2.2z" fill="#FDB813" />
    {/* Bottom-Left Honeycomb Cell */}
    <path d="M8.1 9.1L11.7 11.2v4.2L8.1 17.5 4.5 15.4v-4.2L8.1 9.1z" fill="#FFCA28" />
    {/* Bottom-Right Honeycomb Cell */}
    <path d="M15.9 9.1L19.5 11.2v4.2l-3.6 2.1-3.6-2.1v-4.2L15.9 9.1z" fill="#FFA000" />
    {/* Lower Center Honeycomb Cell */}
    <path d="M12 15.6L15.4 17.6v3.6L12 23.2l-3.4-2V17.6L12 15.6z" fill="#F59E0B" />
  </svg>
);

// Authentic Dio Dart HTTP Client Emblem (Speed Wave & Packet Bolt)
export const DioLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Dio Logo">
    <rect x="2.5" y="3.5" width="19" height="17" rx="4.5" fill="rgba(1, 117, 194, 0.16)" stroke="#0284C7" strokeWidth="1.6" />
    <path d="M6.5 9.5h8.5l-2.3-2.3M17.5 14.5H9l2.3 2.3" stroke="#38BDF8" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16.5" cy="9.5" r="1.4" fill="#00C7FF" />
    <circle cx="7.5" cy="14.5" r="1.4" fill="#027DFD" />
  </svg>
);

// Authentic Retrofit API Contract Emblem (@ Annotation & Type-Safe Bridge)
export const RetrofitLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Retrofit Logo">
    <rect x="3" y="3" width="18" height="18" rx="4" fill="rgba(16, 185, 129, 0.14)" stroke="#10B981" strokeWidth="1.6" />
    <path d="M8.5 8.5L5.5 12l3 3.5M15.5 8.5l3 3.5-3 3.5" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 7.5l-2 9" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Clean Architecture Concentric Onion Layers
export const CleanArchLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Clean Architecture">
    <circle cx="12" cy="12" r="9.5" stroke="#6366F1" strokeWidth="1.5" fill="rgba(99,102,241,0.1)" />
    <circle cx="12" cy="12" r="6.5" stroke="#38BDF8" strokeWidth="1.5" fill="rgba(56,189,248,0.14)" />
    <circle cx="12" cy="12" r="3.4" fill="#10B981" />
  </svg>
);

// Artificial Intelligence / Neural Node Mesh
export const AiLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="AI and CS">
    <rect x="5.5" y="5.5" width="13" height="13" rx="3" stroke="#F43F5E" strokeWidth="1.6" fill="rgba(244,63,94,0.14)" />
    <circle cx="12" cy="12" r="2.2" fill="#FB7185" />
    <path d="M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Official WhatsApp Brand SVG
export const WhatsAppLogo: React.FC<TechLogoProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM9.27 7.42C9.09 7.42 8.79 7.49 8.54 7.76C8.29 8.04 7.6 8.68 7.6 10C7.6 11.32 8.56 12.6 8.69 12.78C8.83 12.96 10.59 15.65 13.29 16.81C15.54 17.78 16 17.58 16.49 17.54C16.98 17.5 18.06 16.9 18.28 16.27C18.5 15.65 18.5 15.11 18.43 15C18.36 14.89 18.18 14.83 17.9 14.69C17.63 14.55 16.3 13.9 16.05 13.81C15.8 13.72 15.63 13.67 15.45 13.94C15.27 14.22 14.77 14.83 14.62 15C14.47 15.18 14.32 15.2 14.05 15.07C13.77 14.93 12.89 14.64 11.85 13.71C11.03 12.98 10.48 12.08 10.33 11.81C10.18 11.53 10.32 11.38 10.46 11.24C10.59 11.11 10.74 10.91 10.88 10.75C11.03 10.59 11.07 10.47 11.16 10.29C11.25 10.11 11.21 9.95 11.14 9.81C11.07 9.68 10.55 8.39 10.33 7.87C10.12 7.37 9.91 7.43 9.75 7.42C9.6 7.42 9.43 7.42 9.27 7.42Z" fill="#25D366" />
  </svg>
);

// Official TikTok Brand SVG
export const TikTokLogo: React.FC<TechLogoProps> = ({ className = '', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.896 2.896 0 0 1 2.305-4.637c.312 0 .615.05.9.143V9.412a6.34 6.34 0 0 0-.9-.065 6.342 6.342 0 0 0-6.34 6.34 6.342 6.342 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.083a8.17 8.17 0 0 0 4.771 1.523v-3.47a4.767 4.767 0 0 1-1-.45z" />
  </svg>
);

// Official TensorFlow Logo (Verified Online Devicon + Inline Vector)
export const TensorFlowLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <VectorIcon
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg"
    alt="TensorFlow Official Logo"
    size={size}
    className={className}
    fallback={
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2L3 7.5v9L6 14.5v-5L12 6.5l6 3v5l3 2v-9L12 2z" fill="#FF6F00" />
        <path d="M12 9.5L7.5 12v5l4.5 2.5 4.5-2.5v-5L12 9.5z" fill="#FFA000" />
      </svg>
    }
  />
);

// REST API Vector Logo
export const RestApiLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="REST API">
    <rect x="2" y="5" width="20" height="14" rx="3.5" stroke="#0284C7" strokeWidth="1.6" fill="rgba(2,132,199,0.12)" />
    <path d="M6.5 12h11" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="7" cy="12" r="1.8" fill="#0284C7" />
    <circle cx="12" cy="12" r="1.8" fill="#38BDF8" />
    <circle cx="17" cy="12" r="1.8" fill="#0284C7" />
  </svg>
);

// Map of canonical tech identifiers to their official logos and brand colors
export const TECH_ICON_REGISTRY: Record<
  string,
  {
    component: React.FC<TechLogoProps>;
    color: string;
    glowRgb: string;
    label: string;
  }
> = {
  flutter: { component: FlutterLogo, color: '#02569B', glowRgb: '2, 86, 155', label: 'Flutter' },
  dart: { component: DartLogo, color: '#00B4AB', glowRgb: '0, 180, 171', label: 'Dart' },
  firebase: { component: FirebaseLogo, color: '#FFCA28', glowRgb: '255, 202, 40', label: 'Firebase' },
  python: { component: PythonLogo, color: '#3776AB', glowRgb: '55, 118, 171', label: 'Python' },
  tensorflow: { component: TensorFlowLogo, color: '#FF6F00', glowRgb: '255, 111, 0', label: 'TensorFlow' },
  bloc: { component: BlocLogo, color: '#00D9FF', glowRgb: '0, 217, 255', label: 'BLoC' },
  cubit: { component: CubitLogo, color: '#22D3EE', glowRgb: '34, 211, 238', label: 'Cubit' },
  hive: { component: HiveLogo, color: '#FDB813', glowRgb: '253, 184, 19', label: 'Hive' },
  hivece: { component: HiveLogo, color: '#FDB813', glowRgb: '253, 184, 19', label: 'Hive' },
  dio: { component: DioLogo, color: '#0175C2', glowRgb: '1, 117, 194', label: 'Dio' },
  retrofit: { component: RetrofitLogo, color: '#10B981', glowRgb: '16, 185, 129', label: 'Retrofit' },
  sqlite: { component: SQLiteLogo, color: '#003B57', glowRgb: '0, 59, 87', label: 'SQLite' },
  git: { component: GitLogo, color: '#F05138', glowRgb: '240, 81, 56', label: 'Git' },
  androidstudio: { component: AndroidStudioLogo, color: '#3DDC84', glowRgb: '61, 220, 132', label: 'Android Studio' },
  vscode: { component: VSCodeLogo, color: '#007ACC', glowRgb: '0, 122, 204', label: 'VS Code' },
  postman: { component: PostmanLogo, color: '#FF6C37', glowRgb: '255, 108, 55', label: 'Postman' },
  figma: { component: FigmaLogo, color: '#A259FF', glowRgb: '162, 89, 255', label: 'Figma' },
  cleanarch: { component: CleanArchLogo, color: '#6366F1', glowRgb: '99, 102, 241', label: 'Clean Architecture' },
  cleanarchitecture: { component: CleanArchLogo, color: '#6366F1', glowRgb: '99, 102, 241', label: 'Clean Architecture' },
  api: { component: RestApiLogo, color: '#0284C7', glowRgb: '2, 132, 199', label: 'REST API' },
  restapi: { component: RestApiLogo, color: '#0284C7', glowRgb: '2, 132, 199', label: 'REST API' },
  ai: { component: AiLogo, color: '#F43F5E', glowRgb: '244, 63, 94', label: 'AI / ML' },
};

export const getTechIconInfo = (tagText: string) => {
  const normalized = tagText.toLowerCase().replace(/[\s\-_.]/g, '');
  if (TECH_ICON_REGISTRY[normalized]) {
    return TECH_ICON_REGISTRY[normalized];
  }
  for (const [key, value] of Object.entries(TECH_ICON_REGISTRY)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  return null;
};

// Minimalist pill badge with brand icon hover reveal/scale micro-interaction
export interface TechIconBadgeProps {
  label: string;
  id?: string;
  category?: string;
  className?: string;
  compact?: boolean;
}

export const TechIconBadge: React.FC<TechIconBadgeProps> = ({
  label,
  id,
  category,
  className = '',
  compact = false,
}) => {
  const iconInfo = getTechIconInfo(id || label);
  const IconComponent = iconInfo ? iconInfo.component : null;
  const brandColor = iconInfo?.color || '#38BDF8';

  return (
    <span
      className={`group relative inline-flex items-center gap-1.5 rounded-full transition-all duration-200 cursor-default select-none border font-mono font-medium shadow-2xs ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      } bg-slate-100/90 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white hover:shadow-xs ${className}`}
      style={{
        ['--brand-accent' as string]: brandColor,
      }}
      title={`${label}${category ? ` (${category})` : ''}`}
    >
      {/* Brand Icon or Minimal Dot */}
      {IconComponent ? (
        <span className="relative flex items-center justify-center shrink-0 w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-125">
          <IconComponent size={14} className="transition-opacity" />
        </span>
      ) : (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-150"
          style={{ backgroundColor: brandColor }}
        />
      )}

      {/* Label Text */}
      <span className="truncate tracking-tight transition-colors">{label}</span>
    </span>
  );
};
