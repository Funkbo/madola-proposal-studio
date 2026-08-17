import { getProposals } from "../src/lib/repositories/proposalRepository.ts";

async function test() {
  const result = await getProposals();
  console.log("getProposals() returned:", result);
}

test();
