[![Build Status](https://github.com/axetroy/deno_machine_id/workflows/test/badge.svg)](https://github.com/axetroy/deno_machine_id/actions)

Get the unique ID of the current machine

Cross platform support

### Usage

> require `--allow-run` or `--allow-all` flag

```typescript
import { getMachineId } from "https://lib.axetroy.xyz/github.com/axetroy/deno_machine_id/mod.ts";

console.log("My Machine ID: ", await getMachineId());
```

## License

The [MIT License](LICENSE)
