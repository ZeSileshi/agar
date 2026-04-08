const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch workspace packages for live changes
config.watchFolders = [
  path.resolve(monorepoRoot, 'packages/i18n'),
  path.resolve(monorepoRoot, 'packages/shared'),
  path.resolve(monorepoRoot, 'packages/matching-engine'),
  path.resolve(monorepoRoot, 'packages/ui'),
];

// Resolve node_modules from both local and hoisted root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force Metro to use the local expo entry by providing explicit extra node modules
config.resolver.extraNodeModules = {
  '@agar/i18n': path.resolve(monorepoRoot, 'packages/i18n'),
  '@agar/shared': path.resolve(monorepoRoot, 'packages/shared'),
  '@agar/matching-engine': path.resolve(monorepoRoot, 'packages/matching-engine'),
};

module.exports = config;
