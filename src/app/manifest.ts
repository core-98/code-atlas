import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CodeAtlas",
    short_name: "CodeAtlas",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "64x64",
        type: "image/svg+xml",
      },
    ],
  };
}
