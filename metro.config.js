const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required for @supabase/realtime-js — Metro doesn't resolve package exports by default
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
