/** @type {import('next').NextConfig} */
const nextConfig = () => {
    const rewrites = () => {
        return [
          {
            source: "/game",
            destination: "http://localhost:8080",
          },
        ];
      };
      return {
        rewrites,
      };
}

module.exports = nextConfig
