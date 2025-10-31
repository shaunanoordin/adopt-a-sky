export default {
  esbuild: {  // Don't minify function names, so Sign In with Google can access the callback.
    minifyIdentifiers: false,
    keepNames: true,
  }
}