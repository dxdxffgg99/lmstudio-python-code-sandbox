import { text, tool, type Tool, type ToolsProviderController } from "@lmstudio/sdk";
import { spawn, spawnSync } from "child_process";
import { rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { findLMStudioHome } from "./findLMStudioHome";

function getPythonPath(): string {
  const lmstudioHome = findLMStudioHome();
  const utilPath = join(lmstudioHome, ".internal", "utils");

  // First, try to use .venv if it exists (so AI can use installed packages)
  const venvWin = join(process.cwd(), ".venv", "Scripts", "python.exe");
  const venvUnix = join(process.cwd(), ".venv", "bin", "python");
  if (existsSync(venvWin)) return venvWin;
  if (existsSync(venvUnix)) return venvUnix;

  const bundled = join(utilPath, process.platform === "win32" ? "python.exe" : "python3");
  if (existsSync(bundled)) return bundled;

  const candidates = process.platform === "win32"
    ? ["python", "py"]
    : ["python3", "python"];

  for (const cmd of candidates) {
    try {
      const res = spawnSync(cmd, ["--version"], { stdio: "ignore", timeout: 2000 });
      if (res.status === 0) return cmd;
    } catch (e) {
      // ignore and try next
    }
  }

  throw new Error("No Python interpreter found: checked bundled LMStudio utils and system PATH");
}

export async function toolsProvider(ctl: ToolsProviderController) {
  const tools: Tool[] = [];

  const createFileTool = tool({
    name: "run_python",
    description: text`
      Run a Python code snippet using the built-in Python interpreter. You cannot import external
      native modules outside the environment, but you have read/write access to the current working directory.

      Pass the code you wish to run as a string in the 'python' parameter.

      You will get the stdout and stderr output of the code execution, thus please print the output
      you wish to return using 'print' or writing to stderr.
    `,
    parameters: { python: z.string() },
    implementation: async ({ python }) => {
      const workingDirectory = ctl.getWorkingDirectory();
      const scriptFileName = `temp_script_${Date.now()}.py`;
      const scriptFilePath = join(workingDirectory, scriptFileName);
      await writeFile(scriptFilePath, python, "utf-8");

      const childProcess = spawn(
        getPythonPath(),
        [scriptFilePath],
        {
          cwd: workingDirectory,
          stdio: "pipe",
          env: {
            NO_COLOR: "true",
          },
        },
      );

      let stdout = "";
      let stderr = "";

      if (childProcess.stdout) childProcess.stdout.setEncoding("utf-8");
      if (childProcess.stderr) childProcess.stderr.setEncoding("utf-8");

      if (childProcess.stdout) childProcess.stdout.on("data", data => { stdout += data; });
      if (childProcess.stderr) childProcess.stderr.on("data", data => { stderr += data; });

      try {
        await new Promise<void>((resolve, reject) => {
          childProcess.on("close", code => {
            if (code === 0) resolve();
            else reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
          });

          childProcess.on("error", err => {
            reject(err);
          });
        });
      } finally {
        try { await rm(scriptFilePath); } catch (e) { /* ignore cleanup errors */ }
      }

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
    },
  });
  tools.push(createFileTool);

  const installPackageTool = tool({
    name: "install_package",
    description: text`
      Install, uninstall, or list Python packages using pip in the virtual environment.
      
      By default, this installs into the .venv virtualenv if available, otherwise to the system Python.
    `,
    parameters: {
      action: z.enum(["install", "uninstall", "list"]).describe("Action to perform: 'install', 'uninstall', or 'list'"),
      package: z.string().optional().describe("Package name or name@version (required for install/uninstall, ignored for list)"),
    },
    implementation: async ({ action, package: pkgName }) => {
      const pythonPath = getPythonPath();
      const pipArgs = ["-m", "pip"];

      if (action === "list") {
        pipArgs.push("list", "--format=json");
      } else if (action === "install") {
        if (!pkgName) throw new Error("Package name required for install action");
        pipArgs.push("install", pkgName);
      } else if (action === "uninstall") {
        if (!pkgName) throw new Error("Package name required for uninstall action");
        pipArgs.push("uninstall", "-y", pkgName);
      }

      const childProcess = spawn(pythonPath, pipArgs, {
        cwd: ctl.getWorkingDirectory(),
        stdio: "pipe",
        env: { NO_COLOR: "true" },
      });

      let stdout = "";
      let stderr = "";

      if (childProcess.stdout) childProcess.stdout.setEncoding("utf-8");
      if (childProcess.stderr) childProcess.stderr.setEncoding("utf-8");

      if (childProcess.stdout) childProcess.stdout.on("data", data => { stdout += data; });
      if (childProcess.stderr) childProcess.stderr.on("data", data => { stderr += data; });

      await new Promise<void>((resolve, reject) => {
        childProcess.on("close", code => {
          if (code === 0) resolve();
          else reject(new Error(`pip ${action} failed with code ${code}. Stderr: ${stderr}`));
        });

        childProcess.on("error", err => {
          reject(err);
        });
      });

      try {
        const result = action === "list" ? JSON.parse(stdout) : stdout;
        return { success: true, message: `pip ${action} completed`, result };
      } catch (e) {
        return { success: true, message: `pip ${action} completed`, output: stdout };
      }
    },
  });
  tools.push(installPackageTool);

  return tools;
}
