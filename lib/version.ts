import packageJson from "../package.json";

/**
 * Current Vyoma UI version taken directly from package.json. This makes sure
 * the version string displayed in the UI always stays in sync with releases
 * without any manual updates.
 */
export const version: string = (packageJson as { version: string }).version;
