[![Build Status](https://github.com/axetroy/deno_machine_id/workflows/test/badge.svg)](https://github.com/axetroy/deno_machine_id/actions)

Get the unique ID of the current machine

Cross platform support

### Usage

```typescript
// Permission in Windows: --allow-run --allow-env=$windir
// Permission in MacOS: --allow-run=/usr/sbin/ioreg
// Permission in Linux: --allow-read=/var/lib/dbus/machine-id,/etc/machine-id
import { getMachineId } from "https://deno.land/x/machine_id@v0.3.0/mod.ts";

console.log("My Machine ID: ", await getMachineId());
```

## License

The [MIT License](LICENSE)
