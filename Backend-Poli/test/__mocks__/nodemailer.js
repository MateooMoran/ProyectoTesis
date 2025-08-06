// test/__mocks__/nodemailer.js
export default {
  createTransport: () => ({
    sendMail: jest.fn((options, callback) => {
      callback(null, { messageId: "mocked-message-id" });
    }),
  }),
};
