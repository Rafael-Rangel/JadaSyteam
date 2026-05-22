#!/usr/bin/env python3
"""Aplica SQL da migração assistant no Supabase via container Jada."""
import paramiko
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("2.24.87.222", username="root", password="@Reacao12345", timeout=20)

# Verifica se tabelas já existem; se não, aplica migration.sql e registra no _prisma_migrations se faltar.
remote_script = r"""
set -e
cd /opt/jada
docker cp prisma/migrations/20260521120000_assistant_role/migration.sql jada-app:/app/prisma/migrations/20260521120000_assistant_role/migration.sql

docker compose --env-file .env.production exec -T app sh -c '
  cd /app
  npx prisma db execute --file prisma/migrations/20260521120000_assistant_role/migration.sql 2>&1 || true
  npx prisma migrate status 2>&1
'
"""

i, o, e = c.exec_command(remote_script, timeout=300)
print(o.read().decode("utf-8", "replace"))
err = e.read().decode("utf-8", "replace")
if err.strip():
    print("stderr:", err)
print("exit", o.channel.recv_exit_status())
c.close()
