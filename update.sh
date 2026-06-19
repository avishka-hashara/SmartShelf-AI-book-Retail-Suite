#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${REPO_NAME:-Book-Shop-Pos}"
BRANCH="${BRANCH:-dev}"
APP_PATH="$HOME/$REPO_NAME"
PHP_BIN="${PHP_BIN:-php}"

if [ ! -d "$APP_PATH/.git" ]; then
  echo "Repository not found at $APP_PATH. Run deploy.sh first."
  exit 1
fi

if command -v composer >/dev/null 2>&1; then
  COMPOSER_CMD="composer"
elif [ -f "$HOME/composer.phar" ]; then
  COMPOSER_CMD="$PHP_BIN $HOME/composer.phar"
else
  echo "Composer is missing. Run deploy.sh first to install Composer."
  exit 1
fi

git -C "$APP_PATH" fetch --all --prune
git -C "$APP_PATH" checkout "$BRANCH"
git -C "$APP_PATH" pull origin "$BRANCH"

cd "$APP_PATH"
$COMPOSER_CMD install --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-req=ext-fileinfo

cp "$APP_PATH/.env.production" "$APP_PATH/.env"
sed -i 's/\r$//' "$APP_PATH/.env"

$PHP_BIN artisan migrate --force
$PHP_BIN artisan db:seed --class=AdminUserSeeder --force
$PHP_BIN artisan db:seed --class=RolePermissionSeeder --force

$PHP_BIN artisan optimize:clear
$PHP_BIN artisan config:clear
$PHP_BIN artisan route:clear
$PHP_BIN artisan view:clear
$PHP_BIN artisan cache:clear

$PHP_BIN artisan route:cache
$PHP_BIN artisan view:cache

echo "Update complete."
