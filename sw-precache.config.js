module.exports = {
  staticFileGlobs: [
    'dist/src/index.html',
    'dist/src/app.min.js',
    'dist/src/*.app.min.js',
    'dist/src/service-worker.js',
    'dist/src/assets/*.js',
    'dist/src/assets/*.svg',
  ],
  root: 'dist/src',
  navigateFallback: '/',
  runtimeCaching: [
    {
      urlPattern: '/api/item/:id',
      handler: 'cacheFirst',
      options: {
        cache: {
          maxEntries: 50,
          name: 'item-cache'
        }
      }
    },
    {
      urlPattern: '/api/:mode',
      handler: 'fastest',
      options: {
        cache: {
          maxEntries: 50,
          name: 'api-cache'
        }
      }
    }
  ]
};