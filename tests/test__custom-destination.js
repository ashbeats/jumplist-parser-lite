const { custom_destination_parser } = require("../src/index.js");

const path = require("path");
const fs = require("fs");

function setup_helpers() {
  const samples = [
    {
      input: fs.readFileSync(
        __dirname +
          "/samples/customDestinations/48e4d97e866a670a.customDestinations-ms"
      ),
      expected: ["C:\\Program Files\\TechSmith\\Camtasia 9\\CamRecorder.exe"]
    }
  ];

  return samples;
}

describe("Custom Destination Parser", () => {
  const inputs = setup_helpers();

  test("parse and extract undefined destinations", () => {
    expect(custom_destination_parser(inputs[0].input)).toMatchObject(
      inputs[0].expected
    );
  });

  test("expects only a buffer", () => {
    expect(() => custom_destination_parser("some-unknown-path")).toThrow(
      "Input must be an instance of Buffer"
    );
  });
});
