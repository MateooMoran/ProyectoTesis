export default {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/setupTestDB.js"],
  transformIgnorePatterns: ["/node_modules/"],
};
