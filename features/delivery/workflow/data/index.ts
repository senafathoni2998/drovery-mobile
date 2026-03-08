import type { Workflow } from "../types";
import { loadPackageWorkflow } from "./load-package";
import { unloadPackageWorkflow } from "./unload-package";

export const WORKFLOWS: Record<string, Workflow> = {
  load_package: loadPackageWorkflow,
  unload_package: unloadPackageWorkflow,
};
