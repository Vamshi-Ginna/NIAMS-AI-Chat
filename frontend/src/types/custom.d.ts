declare module 'react-syntax-highlighter' {
    import { ComponentType, ReactNode } from 'react';
  
    export interface SyntaxHighlighterProps {
      language: string;
      style: object;
      children: ReactNode;
      PreTag?: string;
      showLineNumbers?: boolean;
    }
  
    export const Prism: ComponentType<SyntaxHighlighterProps>;
    export const Light: ComponentType<SyntaxHighlighterProps>;
  }
  
  declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
    export const okaidia: object;
  }  