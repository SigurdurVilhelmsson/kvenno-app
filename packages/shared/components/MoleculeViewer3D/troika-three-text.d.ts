// troika-three-text ships no type declarations. drei depends on it for `<Text>`;
// MoleculeViewer3D needs only the one function that configures it.
declare module 'troika-three-text' {
  export function configureTextBuilder(config: {
    /** Build glyph geometry in a Web Worker (the default) or on the main thread. */
    useWorker?: boolean;
  }): void;
}
