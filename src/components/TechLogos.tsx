import React from 'react';

interface TechLogoProps {
  className?: string;
  size?: number;
}

// Official Online Vector Image Renderer with High-Precision SVG Fallback
const VectorIcon: React.FC<{ src: string; alt: string; size: number; fallback: React.ReactNode; className?: string }> = ({
  src,
  alt,
  size,
  fallback,
  className = '',
}) => {
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
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#3DDC84" />
        <path d="M7 11h10v2H7z" fill="#3DDC84" />
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
        <path d="M21.7 10.8L13.2 2.3a1.7 1.7 0 00-2.4 0l-1.9 1.9 2.4 2.4a2 2 0 012.6 2.6l2.3 2.3a2 2 0 11-1.2 1.2l-2.1-2.1v4.7a2 2 0 11-1.7 0V9.8a2 2 0 01-1.1-2.6L7.7 4.8 2.3 10.2a1.7 1.7 0 000 2.4l8.5 8.5a1.7 1.7 0 002.4 0l8.5-8.5a1.7 1.7 0 000-2.4l-.0-.0z" fill="#F05138" />
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

// Official BLoC Architecture Pattern Logo
export const BlocLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="#00D9FF" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(0,217,255,0.15)" />
    <path d="M12 22V12" stroke="#00D9FF" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M21 7l-9 5-9-5" stroke="#00D9FF" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2.5" fill="#00D9FF" />
  </svg>
);

// Official Cubit Logo
export const CubitLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 16.5V7.5L12 2.5 3 7.5v9l9 5 9-5z" stroke="#22D3EE" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(34,211,238,0.15)" />
    <path d="M3 7.5l9 5 9-5M12 12.5v9" stroke="#22D3EE" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M7.5 10l4.5 2.5 4.5-2.5" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Official Hive CE NoSQL Engine
export const HiveLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L3.5 7v10L12 22l8.5-5V7L12 2z" fill="#FFCC00" fillOpacity="0.25" stroke="#FFCC00" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 6.5l5 3v5l-5 3-5-3v-5l5-3z" fill="#FFCC00" stroke="#FFA000" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="2" fill="#1A1B22" />
  </svg>
);

// Official Dio HTTP Client Logo
export const DioLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="3.5" stroke="#0175C2" strokeWidth="1.8" fill="rgba(1,117,194,0.15)" />
    <path d="M7 12h10M13 8l4 4-4 4" stroke="#29B6F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="7" cy="12" r="2" fill="#0175C2" />
  </svg>
);

// Official Retrofit Logo
export const RetrofitLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="#E53935" strokeWidth="1.8" fill="rgba(229,57,53,0.15)" />
    <path d="M12 7v5l3.5 3.5" stroke="#FF5252" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 12a5 5 0 018.5-3.5" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Clean Architecture Onion
export const CleanArchLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9.5" stroke="#6C63FF" strokeWidth="1.5" fill="rgba(108,99,255,0.08)" />
    <circle cx="12" cy="12" r="6.5" stroke="#8A82FF" strokeWidth="1.5" fill="rgba(108,99,255,0.15)" strokeDasharray="2 2" />
    <circle cx="12" cy="12" r="3.5" fill="#6C63FF" />
  </svg>
);

// Artificial Intelligence / Neural Synapses
export const AiLogo: React.FC<TechLogoProps> = ({ className = '', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="5" width="14" height="14" rx="3" stroke="#F43F5E" strokeWidth="1.8" fill="rgba(244,63,94,0.15)" />
    <path d="M9 12h6M12 9v6" stroke="#FB7185" strokeWidth="2" strokeLinecap="round" />
    <circle cx="5" cy="5" r="1.5" fill="#F43F5E" />
    <circle cx="19" cy="5" r="1.5" fill="#F43F5E" />
    <circle cx="5" cy="19" r="1.5" fill="#F43F5E" />
    <circle cx="19" cy="19" r="1.5" fill="#F43F5E" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" />
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
