import { publicModelSnapshot } from "../models/snapshot";
import { definePages } from "./pages.js";
export const discoveryPages = definePages(publicModelSnapshot);
export const discoveryPage = (path: string) =>
  discoveryPages.find((page) => page.path === path);
