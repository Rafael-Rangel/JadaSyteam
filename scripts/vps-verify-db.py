#!/usr/bin/env python3
import paramiko
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("2.24.87.222", username="root", password="@Reacao12345", timeout=20)

queries = [
    "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 6;",
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'restrictToAssignedCompanies';",
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('AssistantCompanyAssignment', 'AssistantAuditLog');",
]

for sql in queries:
    print("\n===", sql[:80], "...")
    cmd = (
        "cd /opt/jada && docker compose --env-file .env.production exec -T app "
        f"npx prisma db execute --stdin <<< '{sql}'"
    )
    # prisma db execute may not support heredoc on all shells - use node one-liner
    escaped = sql.replace("'", "\\'")
    cmd = (
        "cd /opt/jada && docker compose --env-file .env.production exec -T app "
        "sh -c \"printf '%s' '" + escaped + "' | npx prisma db execute --stdin\""
    )
    i, o, e = c.exec_command(cmd, timeout=120)
    print(o.read().decode("utf-8", "replace"))
    err = e.read().decode("utf-8", "replace")
    if err.strip():
        print("stderr:", err)

c.close()
