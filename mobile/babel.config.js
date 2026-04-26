module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Worklets plugin (was react-native-reanimated/plugin in <= reanimated 3).
      // Must be the last plugin per the Reanimated 4 migration guide.
      'react-native-worklets/plugin',
    ],
  };
};
