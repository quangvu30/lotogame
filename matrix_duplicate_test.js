import { generateMatrix9x9 } from "./src/utils/generator.js";

function matrixToKey(matrix) {
  // Serialize the 9x9 matrix to a compact string
  return matrix
    .map((row) => row.map((v) => (v === null ? "x" : v)).join(","))
    .join("|");
}

function computeDuplicateStats(matrices) {
  const keys = matrices.map(matrixToKey);
  const counts = new Map();
  for (const k of keys) {
    counts.set(k, (counts.get(k) || 0) + 1);
  }

  const totalClients = matrices.length;
  const duplicateGroups = Array.from(counts.values()).filter((c) => c > 1);
  const duplicatedClients = duplicateGroups.reduce((sum, c) => sum + c, 0);
  const uniqueClients = totalClients - duplicatedClients;

  const duplicateRateClients = (duplicatedClients / totalClients) * 100;
  const uniqueRateClients = (uniqueClients / totalClients) * 100;

  // Also compute exact duplicate pairs count
  const duplicatePairs = duplicateGroups.reduce(
    (sum, c) => sum + (c * (c - 1)) / 2,
    0
  );

  return {
    totalClients,
    uniqueMatrices: counts.size,
    duplicatedClients,
    uniqueClients,
    duplicateRateClients,
    uniqueRateClients,
    duplicatePairs,
  };
}

function runCaseSameName(count, name) {
  const matrices = Array.from({ length: count }, () => generateMatrix9x9(name));
  return computeDuplicateStats(matrices);
}

function runCaseUniqueNames(count) {
  const matrices = Array.from({ length: count }, (_, i) =>
    generateMatrix9x9(`user-${String(i + 1).padStart(3, "0")}`)
  );
  return computeDuplicateStats(matrices);
}

async function main() {
  const count = Number(process.env.CLIENTS || 140);
  const start = Date.now();

  const sameNameStats = runCaseSameName(count, "SameName");
  const uniqueNameStats = runCaseUniqueNames(count);

  const elapsed = Date.now() - start;

  console.log("=== Duplicate Matrix Check ===");
  console.log(`Clients: ${count}`);
  console.log(`Elapsed: ${elapsed} ms`);

  console.log("\n-- Case A: All clients same name --");
  console.log(`Unique matrices: ${sameNameStats.uniqueMatrices}`);
  console.log(
    `Duplicated clients: ${sameNameStats.duplicatedClients}/${
      sameNameStats.totalClients
    } (${sameNameStats.duplicateRateClients.toFixed(4)}%)`
  );
  console.log(`Duplicate pairs: ${sameNameStats.duplicatePairs}`);

  console.log("\n-- Case B: All clients unique names --");
  console.log(`Unique matrices: ${uniqueNameStats.uniqueMatrices}`);
  console.log(
    `Duplicated clients: ${uniqueNameStats.duplicatedClients}/${
      uniqueNameStats.totalClients
    } (${uniqueNameStats.duplicateRateClients.toFixed(4)}%)`
  );
  console.log(`Duplicate pairs: ${uniqueNameStats.duplicatePairs}`);
}

main().catch((err) => {
  console.error("Error running test:", err);
  process.exit(1);
});
