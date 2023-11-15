/** @type {import('next').NextConfig} */
const nextConfig = {
  "reactStrictMode": false,
  webpack: (config, { dev, webpack }) => {
    if (dev) {
      config.module.rules.push({
        test: /\.(spec,test,stories)\.(js|jsx)$/,
        loader: 'ignore-loader',
      });
    }

    // SVG Loader
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Load GLSL Shaders
    // config.module.rules.push({
    //   test: /\.(glsl|vs|fs|vert|frag)$/,
    //   exclude: /node_modules/,
    //   use: ['raw-loader', 'glslify-loader'],
    // })

    return config;
  },

  env: {
    CANVAS_RENDERER: JSON.stringify(true),
    WEBGL_RENDERER: JSON.stringify(true),
    WEBGL_DEBUG: JSON.stringify(false),
  },
}

module.exports = nextConfig
