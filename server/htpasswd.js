import fs from "fs";
import path from "path";
import apacheMD5 from "apache-md5";

const dataDir = path.join(process.cwd(), "data");
export const htpasswdPath = path.join(dataDir, ".htpasswd");

function ensureFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(htpasswdPath)) fs.writeFileSync(htpasswdPath, "", "utf8");
}

export function usernameIsValid(username) {
  return /^[a-zA-Z0-9._-]{3,32}$/.test(username);
}

export function passwordIsValid(password) {
  return typeof password === "string" && password.length >= 8 && password.length <= 72;
}

export function userExists(username) {
  ensureFile();
  const lines = fs.readFileSync(htpasswdPath, "utf8").split("\n").filter(Boolean);
  return lines.some((l) => l.startsWith(username + ":"));
}

export function addUser(username, password) {
  ensureFile();
  const hash = apacheMD5(password); // $apr1$... format
  fs.appendFileSync(htpasswdPath, `${username}:${hash}\n`, "utf8");
}

export function verifyUser(username, password) {
  ensureFile();
  const lines = fs.readFileSync(htpasswdPath, "utf8").split("\n").filter(Boolean);
  const line = lines.find((l) => l.startsWith(username + ":"));
  if (!line) return false;

  const storedHash = line.split(":").slice(1).join(":");
  const candidateHash = apacheMD5(password, storedHash);
  return candidateHash === storedHash;
}
