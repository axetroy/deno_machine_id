import {
  assert,
  assertNotEquals
} from "https://deno.land/std@v0.35.0/testing/asserts.ts";
import { getMachineId } from "./mod.ts";

const { test } = Deno;

function isValidId(machindId: string): boolean {
  return /^[a-z-\d]+$/i.test(machindId);
}

test(async function testGetMachineId() {
  const id = await getMachineId();

  console.log("machine ID: ", id);

  assertNotEquals(id, "");
  assert(isValidId(id));
});
