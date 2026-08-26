import { join } from "path";

/** Always `apps/api/uploads` — not dependent on process.cwd() in monorepo. */
export const UPLOADS_DIR = join(__dirname, "..", "..", "uploads");
