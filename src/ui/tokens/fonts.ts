/**
 * Self-hosted fonts (Fontsource). Newsreader, the display serif, carries its
 * optical-size axis, so headlines and the big ordering numbers draw on its
 * display cut and small sizes on its text cut; Instrument Sans (weight axis)
 * is the interface and body face. IBM Plex Mono, at two weights, belongs to
 * the drawings: diagram labels, part balloons, piece tags, traces, the
 * chapter rail and the Burpees count. Imported by main.tsx (the live page)
 * and the showcase; the build preloads the two Latin files the first screen
 * needs (fontPreload.ts).
 */
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
