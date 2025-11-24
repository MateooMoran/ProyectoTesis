export default {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testEnvironment: "node",
  // Si renombrás la carpeta `__tests__` a `test`, actualizá esta ruta
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  transformIgnorePatterns: [
    "/node_modules/(?!(node-fetch)/)"
  ],
};
