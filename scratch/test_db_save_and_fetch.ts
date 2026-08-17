import { getSupabaseClient } from "../src/lib/supabase/getSupabaseClient";
import { saveInteractiveProposal, getInteractiveProposal, DEFAULT_MASTER_PROPOSAL } from "../src/lib/repositories/interactiveProposalRepository";
import { generateSecurePublicToken } from "../src/lib/utils/secureToken";

async function testSaveAndFetch() {
  console.log("=== Testing saveInteractiveProposal & getInteractiveProposal ===");
  const testToken = generateSecurePublicToken();
  console.log("Generated Test Token:", testToken);

  const proposalData = {
    ...DEFAULT_MASTER_PROPOSAL,
    id: `prop-${testToken.substring(0, 8)}`,
    publicSlug: testToken,
    publicToken: testToken,
    reference: `REF_${Date.now()}`,
  };

  console.log("Saving proposal to DB...");
  await saveInteractiveProposal(proposalData);
  console.log("Saved. Now querying getInteractiveProposal...");

  const fetched = await getInteractiveProposal(testToken);
  console.log("Fetched Result:", fetched ? `SUCCESS (Customer: ${fetched.customer.name})` : "NULL (404)");

  // Test RPC directly
  const supabase = await getSupabaseClient();
  const { data: rpcData, error: rpcErr } = await supabase.rpc("get_public_proposal", { p_token: testToken });
  console.log("RPC Data:", JSON.stringify(rpcData, null, 2));
  console.log("RPC Error:", rpcErr);
}

testSaveAndFetch();
