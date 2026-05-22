#!/usr/bin/env python3
import paramiko
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("2.24.87.222", username="root", password="@Reacao12345", timeout=20)

node_script = r"""
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const migrations = await p.$queryRawUnsafe(
    "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 6"
  );
  console.log('MIGRATIONS:', JSON.stringify(migrations));
  const tables = await p.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('AssistantCompanyAssignment','AssistantAuditLog')"
  );
  console.log('TABLES:', JSON.stringify(tables));
  const cols = await p.$queryRawUnsafe(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'restrictToAssignedCompanies'"
  );
  console.log('USER_COL:', JSON.stringify(cols));
  await p.$disconnect();
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
"""

sftp = c.open_sftp()
with sftp.file("/tmp/check-db.js", "w") as f:
    f.write(node_script)
sftp.close()

cmds = [
    "cd /opt/jada && docker cp prisma/migrations/20260521120000_assistant_role jada-app:/app/prisma/migrations/20260521120000_assistant_role 2>/dev/null || true",
    "cd /opt/jada && docker cp prisma/schema.prisma jada-app:/app/prisma/schema.prisma",
    "cd /opt/jada && docker compose --env-file .env.production exec -T app npx prisma migrate deploy",
    "cd /opt/jada && docker compose --env-file .env.production exec -T app npx prisma generate",
    "docker cp /tmp/check-db.js jada-app:/app/check-db.js",
    "cd /opt/jada && docker compose --env-file .env.production exec -T app sh -c 'cd /app && node check-db.js'",
    "cd /opt/jada && docker compose --env-file .env.production restart app",
]

for cmd in cmds:
    print("\n>>>", cmd[:100])
    i, o, e = c.exec_command(cmd, timeout=300)
    out = o.read().decode("utf-8", "replace")
    err = e.read().decode("utf-8", "replace")
    if out.strip():
        print(out[-2500:])
    if err.strip():
        print("stderr:", err[-1500:])
    code = o.channel.recv_exit_status()
    print("exit", code)
    if code != 0 and "check-db" in cmd:
        break

c.close()
