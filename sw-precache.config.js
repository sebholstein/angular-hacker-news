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
  runtimeCaching: [
    {
      urlPattern: '/list/:mode',
      handler: 'fastest',
      options: {
        cache: {
          maxEntries: 10,
          name: 'list-cache'
        }
      }
    },
    {
      urlPattern: '/item/:id',
      handler: 'fastest',
      options: {
        cache: {
          maxEntries: 10,
          name: 'item-cache'
        }
      }
    },
    {
      urlPattern: '/api/item/:id',
      handler: 'fastest',
      options: {
        cache: {
          maxEntries: 50,
          name: 'api-cache'
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