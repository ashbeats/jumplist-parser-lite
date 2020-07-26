const { automatic_destination_parser } = require("../dist/index.js");
const path = require("path");
const fs = require("fs");

function setup_helpers() {
  const samples = [
    {
      input: fs.readFileSync(
        __dirname +
          "/samples/automaticDestinations/5f7b5f1e01b83767.automaticDestinations-ms"
      ),
      expected: undefined
    },
    {
      input: fs.readFileSync(
        __dirname +
          "/samples/automaticDestinations/7e4dca80246863e3.automaticDestinations-ms"
      ),
      expected: []
    },
    {
      input: fs.readFileSync(
        __dirname +
          "/samples/automaticDestinations/f01b4d95cf55d32a.automaticDestinations-ms"
      ),
      expected: ["C:\\Temp", "C:\\Temp\\1", "C:\\", "C:\\Users\\e\\Desktop"]
    }
  ];

  return samples;
}

describe("Automatic Destination Parser", () => {
  const inputs = setup_helpers();

  test("parse and extract multiple destinations", () => {
    expect(automatic_destination_parser(inputs[2].input)).toEqual(
      expect.arrayContaining(inputs[2].expected)
    );
  });

  test("expects only a buffer as input", () => {
    expect(() => automatic_destination_parser("some-unknown-path")).toThrow(
      "Input must be an instance of Buffer"
    );
  });

  test("throws when header mismatch", () => {
    expect(() => automatic_destination_parser(Buffer.alloc(1024))).toThrow(
      "Header Signature: Expected d0cf11e0a1b11ae1 saw 0000000000000000"
    );
  });

  test("parse and extract undefined destinations", () => {
    expect(automatic_destination_parser(inputs[0].input)).toBeUndefined();
  });

  test("parse and extract empty destinations", () => {
    expect(automatic_destination_parser(inputs[1].input)).toMatchObject([]);
  });
});
