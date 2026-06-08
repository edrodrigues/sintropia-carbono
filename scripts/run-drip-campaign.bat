@echo off
cd /d "%~dp0.."
npx tsx scripts/send-drip-emails.ts
