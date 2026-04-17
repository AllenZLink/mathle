import type { Metadata, Viewport } from "next";

export const siteUrl = "https://mathlegame.com";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mathle",
    template: "%s"
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" }
    ]
  },
  manifest: "/site.webmanifest"
};

export const defaultViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false
};
