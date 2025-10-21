/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // This setting ensures that the exported app is static and can be deployed to Firebase hosting
    distDir: 'out',
}

module.exports = nextConfig

// Made with Bob
