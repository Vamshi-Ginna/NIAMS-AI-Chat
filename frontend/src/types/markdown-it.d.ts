declare module 'markdown-it' {
    class MarkdownIt {
      constructor();
      render(markdown: string): string;
    }
    export = MarkdownIt;
  }
  