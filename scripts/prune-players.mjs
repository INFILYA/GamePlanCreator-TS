import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const KEEP_ORDER = [
  "Lucas Clark",
  "Artem Tarasov",
  "Kaizen Porter",
  "Forbe Wong",
  "Ivan Cheung",
  "Finn Crix",
];
const KEEP = new Set(KEEP_ORDER);

const STAT_KEYS = [
  "A++",
  "A+",
  "A=",
  "A!",
  "A-",
  "S++",
  "S+",
  "S!",
  "S-",
  "S=",
  "R++",
  "R+",
  "R!",
  "R-",
  "R=",
  "blocks",
  "unforcedError",
];

const ARRAY_KEYS = [
  "APQ",
  "APH",
  "A2Q",
  "A2H",
  "A4Q",
  "A4H",
  "A1Q",
  "A1H",
  "AK1Q",
  "AKCQ",
  "AK7Q",
  "S1F",
  "S1J",
  "S5F",
  "S5J",
  "S6F",
  "S6J",
];

function zeroArray(length = 36) {
  return Array(length).fill(0);
}

function resetPlayerStats(player) {
  const reset = { ...player };

  for (const key of STAT_KEYS) {
    reset[key] = 0;
  }

  for (const key of ARRAY_KEYS) {
    const current = reset[key];
    reset[key] = Array.isArray(current) ? zeroArray(current.length) : zeroArray();
  }

  reset.boardPosition = 0;
  reset.setterBoardPosition = 0;
  reset.zoneOfAttack = 0;
  reset.team = "Warriors-17U";

  return reset;
}

const raw = execSync("firebase database:get /players", {
  cwd: root,
  encoding: "utf8",
});
const allPlayers = JSON.parse(raw);

const keptPlayers = {};
const removed = [];

for (const [name, player] of Object.entries(allPlayers)) {
  if (KEEP.has(name)) {
    keptPlayers[name] = resetPlayerStats(player);
  } else {
    removed.push(name);
  }
}

const missing = KEEP_ORDER.filter((name) => !keptPlayers[name]);
if (missing.length > 0) {
  console.error("Missing players in database:", missing.join(", "));
  process.exit(1);
}

const playersPath = join(root, "scripts", "players-kept.json");
writeFileSync(playersPath, JSON.stringify(keptPlayers, null, 2));

const teamRaw = execSync("firebase database:get /teams/Warriors-17U", {
  cwd: root,
  encoding: "utf8",
});
const team = JSON.parse(teamRaw);
const resetTeam = {
  ...team,
  startingSquad: [...KEEP_ORDER],
  ...Object.fromEntries(STAT_KEYS.map((key) => [key, 0])),
};

const teamPath = join(root, "scripts", "team-warriors.json");
writeFileSync(teamPath, JSON.stringify(resetTeam, null, 2));

console.log(`Kept ${Object.keys(keptPlayers).length} players.`);
console.log(`Removed ${removed.length} players.`);
console.log("Removed:", removed.sort().join(", "));
