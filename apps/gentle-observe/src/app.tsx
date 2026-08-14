import { useKeyboard, useRenderer } from "@opentui/solid";

export interface AppProps {
  readonly onQuit?: () => void;
}

export const App = (props: AppProps) => {
  const renderer = useRenderer();
  const quit = () => {
    if (renderer.isDestroyed) return;
    renderer.destroy();
  };

  useKeyboard((key) => {
    if (key.name === "q") {
      props.onQuit?.() ?? quit();
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <text>Discovery is not connected.</text>
      <text>q quit</text>
    </box>
  );
};
