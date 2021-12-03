import path from "path";
import os from "os";
import fs from "fs-extra";
import { getEasyopsConfig } from "@next-core/repo-config";

const isTesting: boolean = process.env.NODE_ENV === "test";

export const testYamlDir = path.join(__dirname, "../../yaml");
export const testApiDir = path.join(testYamlDir, "api");
export const testModelDir = path.join(testYamlDir, "model");

export const tmpDir = isTesting
  ? path.join(os.tmpdir(), "contract")
  : /* istanbul ignore next (never reach in test) */
    fs.mkdtempSync(path.join(os.tmpdir(), "contract-"));

export const { contractYamlDir } = getEasyopsConfig();
export const easyopsYamlDir = path.join(tmpDir, contractYamlDir);
export const easyopsApiDir = path.join(easyopsYamlDir, "api");
export const easyopsModelDir = path.join(easyopsYamlDir, "model");

export const yamlDir = isTesting
  ? testYamlDir
  : /* istanbul ignore next (never reach in test) */
    easyopsYamlDir;
export const apiDir = isTesting
  ? testApiDir
  : /* istanbul ignore next (never reach in test) */
    easyopsApiDir;
export const modelDir = isTesting
  ? testModelDir
  : /* istanbul ignore next (never reach in test) */
    easyopsModelDir;

export const i18nYamlFile = ".info.yaml";
