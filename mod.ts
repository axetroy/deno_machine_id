const { run, build, readAll, readFile, env } = Deno;

// Get machine ID
// Requires `--allow-run` or `--allow-all`
export async function getMachineId(): Promise<string> {
  switch (build.os) {
    case "linux":
      return getMachineIDLinux();
    case "win":
      return getMachineIDWin();
    case "mac":
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
    case "win":
      return output
        .toString()
        .split("REG_SZ")[1]
        .replace(/\r+|\n+|\s+/gi, "")
        .trim();
    case "mac":
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
  const winDir = env()["windir"];
  const ps = run({
    stdout: "piped",
    args: [
      `${winDir}\\System32\\REG.exe`,
      "QUERY",
      "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography",
      "/v",
      "MachineGuid"
    ]
  });

  return parse(await readAll(ps.stdout!));
}

async function getMachineIDMac(): Promise<string> {
  const ps = run({
    stdout: "piped",
    args: ["ioreg", "-rd1", "-c", "IOPlatformExpertDevice"]
  });

  return parse(await readAll(ps.stdout!));
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
    })
  );
}
