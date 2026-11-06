const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

// Find the project and monorepo workspace root
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files within mobile app and monorepo root
config.watchFolders = [projectRoot, monorepoRoot];

// Configure resolver for monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Store the original resolver
const defaultResolver = config.resolver.resolveRequest;

// Resolve workspace packages to their source files
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Check if it's a @spezivibe workspace package inside apps/mobile/packages
  if (moduleName && moduleName.startsWith('@spezivibe/')) {
    const packageName = moduleName.split('/')[1];
    const packagePath = path.join(projectRoot, 'packages', packageName);

    if (fs.existsSync(packagePath)) {
      const sourceIndex = path.join(packagePath, 'src', 'index.ts');
      if (fs.existsSync(sourceIndex)) {
        return { filePath: sourceIndex, type: 'sourceFile' };
      }
      const sourceIndexTsx = path.join(packagePath, 'src', 'index.tsx');
      if (fs.existsSync(sourceIndexTsx)) {
        return { filePath: sourceIndexTsx, type: 'sourceFile' };
      }
    }
  }

  // Check if it's a @future-health workspace package inside packages/
  if (moduleName && moduleName.startsWith('@future-health/')) {
    const packageName = moduleName.split('/')[1];
    const packagePath = path.join(monorepoRoot, 'packages', packageName);

    if (fs.existsSync(packagePath)) {
      const sourceIndex = path.join(packagePath, 'src', 'index.ts');
      if (fs.existsSync(sourceIndex)) {
        return { filePath: sourceIndex, type: 'sourceFile' };
      }
      const sourceIndexTsx = path.join(packagePath, 'src', 'index.tsx');
      if (fs.existsSync(sourceIndexTsx)) {
        return { filePath: sourceIndexTsx, type: 'sourceFile' };
      }
    }
  }

  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
