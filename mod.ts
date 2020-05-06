const { run, build, readAll, readFile, env } = Deno;

// Get machine ID
// Permission in Windows: --allow-run --allow-env
// Permission in MacOS: --allow-run
// Permission in Linux: --allow-read
export async function getMachineId(): Promise<string> {
  switch (build.os) {
    case "linux":
      return getMachineIDLinux();
    case "windows":
      return getMachineIDWin();
    case "darwin":
      return getMachineIDMac();
    default:
      throw new Error(`Not support your operate system '${build.os}'`);
  }
}

function parse(bytes: Uint8Array): string {
  const output = new TextDecoder().decode(bytes);

  switch (build.os) {
    case "linux":
      return output.trim();
    case "windows":
      return output
        .toString()
        .split("REG_SZ")[1]
        .replace(/\r+|\n+|\s+/gi, "")
        .trim();
    case "darwin":
      const lines = output.split("\n");
      for (const line of lines) {
        // here is the match line
        // "IOPlatformUUID" = "A8226C69-2364-5B3E-83CC-1A72D7531679"
        if (line.indexOf("IOPlatformUUID") > 0) {
          const [_, val] = line.split(/\s*=\s*/);
          return val.replace(/^"|"$/g, "");
        }
      }
      return "";
    default:
      throw new Error(`Not support your operate system '${build.os}'`);
  }
}

async function getMachineIDWin(): Promise<string> {
  const winDir = env.get("windir");
  const ps = run({
    stdout: "piped",
    cmd: [
      `${winDir}\\System32\\REG.exe`,
      "QUERY",
      "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography",
      "/v",
      "MachineGuid",
    ],
  });

  const output = await readAll(ps.stdout!);

  ps.stdout?.close();
  ps.close();

  return parse(output);
}

async function getMachineIDMac(): Promise<string> {
  const ps = run({
    stdout: "piped",
    cmd: ["ioreg", "-rd1", "-c", "IOPlatformExpertDevice"],
  });

  const output = await readAll(ps.stdout!);

  ps.stdout?.close();
  ps.close();

  return parse(output);
}

async function getMachineIDLinux(): Promise<string> {
  // dbusPath is the default path for dbus machine id.
  const dbusPath = "/var/lib/dbus/machine-id";
  // dbusPathEtc is the default path for dbus machine id located in /etc.
  // Some systems (like Fedora 20) only know this path.
  // Sometimes it's the other way round.
  const dbusPathEtc = "/etc/machine-id";

  return parse(
    await readFile(dbusPath).catch(() => {
      // try fallback path
      return readFile(dbusPathEtc);
    }),
  );
}
