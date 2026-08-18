export interface TerminalLayout {
  readonly compact: boolean;
}

export const layoutFor = (width: number, height: number): TerminalLayout => ({
  compact: width < 90 || height < 24,
});
