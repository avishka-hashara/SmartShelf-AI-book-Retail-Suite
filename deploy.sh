#!/usr/bin/env bash
set -euo pipefail

# When run via  curl | bash  stdin is the script itself.
# Redirect it to /dev/null so interactive child processes don't block.
exec 0</dev/null

REPO_NAME="${REPO_NAME:-Book-Shop-Pos}"
BRANCH="${BRANCH:-dev}"
REPO_URL="${REPO_URL:-https://github.com/APPLANTICS/Book-Shop-Pos.git}"
APP_PATH="$HOME/$REPO_NAME"
PUBLIC_HTML="$HOME/public_html"
PHP_BIN="${PHP_BIN:-php}"

clone_or_update_repo() {
  if [ -d "$APP_PATH/.git" ]; then
    echo "Repository already exists. Pulling latest $BRANCH..."
    git -C "$APP_PATH" fetch --all --prune
    git -C "$APP_PATH" checkout "$BRANCH"
    git -C "$APP_PATH" pull origin "$BRANCH"
    return
  fi

  echo "Cloning repository into $APP_PATH..."
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    local auth_url
    auth_url="${REPO_URL/https:\/\//https://$GITHUB_TOKEN@}"
    git clone -b "$BRANCH" "$auth_url" "$APP_PATH"
  else
    git clone -b "$BRANCH" "$REPO_URL" "$APP_PATH"
  fi
}

install_composer_if_missing() {
  if command -v composer >/dev/null 2>&1; then
    COMPOSER_CMD="composer"
    return
  fi

  if [ ! -f "$HOME/composer.phar" ]; then
    echo "Installing Composer locally..."
    $PHP_BIN -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    $PHP_BIN composer-setup.php --install-dir="$HOME" --filename=composer.phar
    $PHP_BIN -r "unlink('composer-setup.php');"
  fi

  COMPOSER_CMD="$PHP_BIN $HOME/composer.phar"
}

prepare_env() {
  cp "$APP_PATH/.env.production" "$APP_PATH/.env"
  sed -i 's/\r$//' "$APP_PATH/.env"
}

install_dependencies() {
  cd "$APP_PATH"
  $COMPOSER_CMD install --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-req=ext-fileinfo
}

link_public_assets() {
  cd "$APP_PATH"
  $PHP_BIN artisan storage:link || true

  cp "$APP_PATH/cpanel-index.php" "$PUBLIC_HTML/index.php"
  cp "$APP_PATH/public/.htaccess" "$PUBLIC_HTML/.htaccess"

  ln -sfn "$APP_PATH/public/build" "$PUBLIC_HTML/build"
  ln -sfn "$APP_PATH/public/storage" "$PUBLIC_HTML/storage"
}

set_permissions() {
  find "$APP_PATH" -type d -exec chmod 755 {} \;
  chmod -R 775 "$APP_PATH/storage" "$APP_PATH/bootstrap/cache"
  find "$APP_PATH" -type f -exec chmod 644 {} \;
}

run_laravel_tasks() {
  cd "$APP_PATH"

  $PHP_BIN artisan key:generate --force
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
}

main() {
  clone_or_update_repo
  install_composer_if_missing
  install_dependencies
  prepare_env
  link_public_assets
  set_permissions
  run_laravel_tasks

  echo "Deployment complete: https://asbookshop.possystem.lk/"
}

main "$@"
