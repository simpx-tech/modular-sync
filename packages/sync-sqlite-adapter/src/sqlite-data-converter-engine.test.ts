import {SQLiteDataConverterEngine} from "./sqlite-data-converter-engine";

describe("Sqlite Data Converter Engine", () => {
  let converter: SQLiteDataConverterEngine = null;

  beforeEach(() => {
    converter = new SQLiteDataConverterEngine();
  });

  describe("Inbound Data Conversion", () => {
    describe("String Conversion", () => {
      it ("should convert string to string", () => {
        const data = "test";
        const convertedData = converter.inbound.asString(data);
        expect(convertedData).toEqual("test");
      })

      it("should convert int to string", () => {
        const data = 5;
        const convertedData = converter.inbound.asString(data);
        expect(convertedData).toEqual("5");
      })

      it("should convert float to string", () => {
        const data = 5.5;
        const convertedData = converter.inbound.asString(data);
        expect(convertedData).toEqual("5.5");
      })

      it("should convert boolean to string", () => {
        const data = true;
        const convertedData = converter.inbound.asString(data);
        expect(convertedData).toEqual("true");

      })

      it("should convert date to string", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.asString(data);
        expect(convertedData).toEqual("2023-01-01T00:00:00.000Z");
      })
    })

    describe("Int Conversion", () => {
      it("should convert string to int", () => {
        const data = "5.5";
        const convertedData = converter.inbound.asInteger(data);
        expect(convertedData).toEqual(5);
      })

      it("should convert int to int", () => {
        const data = 5;
        const convertedData = converter.inbound.asInteger(data);
        expect(convertedData).toEqual(5);
      })

      it("should convert float to int", () => {
        const data = 5.5;
        const convertedData = converter.inbound.asInteger(data);
        expect(convertedData).toEqual(5);
      })

      it("should convert boolean to int", () => {
        const data = true;
        const convertedData = converter.inbound.asInteger(data);
        expect(convertedData).toEqual(1);
      })

      it("should convert date to int", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.asInteger(data);
        expect(convertedData).toEqual(1672531200000);
      })
    })

    describe("Float Conversion", () => {
      it("should convert string to int", () => {
        const data = "5.5";
        const convertedData = converter.inbound.asFloat(data);
        expect(convertedData).toEqual(5.5);
      })

      it("should convert int to float", () => {
        const data = 5;
        const convertedData = converter.inbound.asFloat(data);
        expect(convertedData).toEqual(5);
      })

      it("should convert float to float", () => {
        const data = 5.5;
        const convertedData = converter.inbound.asFloat(data);
        expect(convertedData).toEqual(5.5);
      })

      it("should convert boolean to float", () => {
        const data = true;
        const convertedData = converter.inbound.asFloat(data);
        expect(convertedData).toEqual(1);
      })

      it("should convert date to float", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.asFloat(data);
        expect(convertedData).toEqual(1672531200000);
      })
    })

    describe("Date Conversion", () => {
      it("should convert string to date", () => {
        const data = "2023-01-01T00:00:00.000Z";
        const convertedData = converter.inbound.asDate(data);
        expect(convertedData).toEqual(new Date("2023-01-01T00:00:00.000Z").getTime());
      })

      it("should convert int to date", () => {
        const data = 1672531200000;
        const convertedData = converter.inbound.asDate(data);
        expect(convertedData).toEqual(new Date("2023-01-01T00:00:00.000Z").getTime());
      })

      it("should convert float to date", () => {
        const data = 1672531200000.5;
        const convertedData = converter.inbound.asDate(data);
        expect(convertedData).toEqual(new Date("2023-01-01T00:00:00.000Z").getTime());
      })

      it("should convert date to date", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.asDate(data);
        expect(convertedData).toEqual(new Date("2023-01-01T00:00:00.000Z").getTime());
      })

      it("should return null if convert boolean to date", () => {
        const data = true;
        const convertedData = converter.inbound.asDate(data);
        expect(convertedData).toBeNull();
      })

      it("should return null if convert undefined to date", () => {
        const data = undefined;
        const convertedData = converter.inbound.asDate(data);
        expect(convertedData).toBeNull();
      })
    })

    describe("Boolean Conversion", () => {
      it("should convert string to boolean", () => {
        const data = "false";
        const convertedData = converter.inbound.asBoolean(data);
        expect(convertedData).toEqual(0);

        const data2 = "true";
        const convertedData2 = converter.inbound.asBoolean(data2);
        expect(convertedData2).toEqual(1);

        const data3 = "0";
        const convertedData3 = converter.inbound.asBoolean(data3);
        expect(convertedData3).toEqual(0);

        const data4 = "1";
        const convertedData4 = converter.inbound.asBoolean(data4);
        expect(convertedData4).toEqual(1);
      })

      it("should convert int to boolean", () => {
        const data = 5;
        const convertedData = converter.inbound.asBoolean(data);
        expect(convertedData).toEqual(1);

        const data2 = 0;
        const convertedData2 = converter.inbound.asBoolean(data2);
        expect(convertedData2).toEqual(0);
      })

      it("should convert float to boolean", () => {
        const data = 5.5;
        const convertedData = converter.inbound.asBoolean(data);
        expect(convertedData).toEqual(1);

        const data2 = 0.0;
        const convertedData2 = converter.inbound.asBoolean(data2);
        expect(convertedData2).toEqual(0);
      })

      it("should convert boolean to boolean", () => {
        const data = true;
        const convertedData = converter.inbound.asBoolean(data);
        expect(convertedData).toEqual(1);

        const data2 = false;
        const convertedData2 = converter.inbound.asBoolean(data2);
        expect(convertedData2).toEqual(0);
      })

      it("should convert date to boolean", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.asBoolean(data);
        expect(convertedData).toEqual(1);
      })
    })

    describe("Connection Conversion", () => {
      it("should convert string to connection", () => {
        const data = "test";
        const convertedData = converter.inbound.asConnection(data);
        expect(convertedData).toBeUndefined();

        const data2 = "0";
        const convertedData2 = converter.inbound.asConnection(data2);
        expect(convertedData2).toEqual(0);
      })

      it("should convert int to connection", () => {
        const data = 5;
        const convertedData = converter.inbound.asConnection(data);
        expect(convertedData).toEqual(5);
      })

      it("should convert float to connection", () => {
        const data = 5.5;
        const convertedData = converter.inbound.asConnection(data);
        expect(convertedData).toEqual(5);
      })

      it("should fail if try to convert boolean to connection", () => {
        const data = true;
        const convertedData = converter.inbound.asConnection(data);
        expect(convertedData).toBeUndefined();
      })

      it("should fail if try to convert date to connection", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.asConnection(data);
        expect(convertedData).toBeUndefined();
      })
    })

    describe("Conversion", () => {
      it("should convert all fields", () => {
        const data = {
          test: "test",
          test2: 5,
          test3: 5.5,
          test4: true,
          test5: new Date("2023-01-01T00:00:00.000Z"),
        }

        const convertedData = converter.inbound.convert(data, {
          test: "string",
          test2: "integer",
          test3: "float",
          test4: "boolean",
          test5: "date",
        });

        expect(convertedData).toEqual({
          test: "test",
          test2: 5,
          test3: 5.5,
          test4: 1,
          test5: new Date("2023-01-01T00:00:00.000Z").getTime(),
        })
      })
    })
  });

  describe("Outbound Data Conversion", () => {
    it("should convert back to string", () => {
      const data = "test";
      const convertedData = converter.outbound.asString(data);
      expect(convertedData).toEqual("test");
    })

    it("should convert back to int", () => {
      const data = 5;
      const convertedData = converter.outbound.asInteger(data);
      expect(convertedData).toEqual(5);
    })

    it("should convert back to float", () => {
      const data = 5.5;
      const convertedData = converter.outbound.asFloat(data);
      expect(convertedData).toEqual(5.5);
    })

    it("should convert back to boolean", () => {
      const data = 0;
      const convertedData = converter.outbound.asBoolean(data);
      expect(convertedData).toEqual(false);

      const data2 = 1;
      const convertedData2 = converter.outbound.asBoolean(data2);
      expect(convertedData2).toEqual(true);
    })

    it("should convert back to date", () => {
      const data = 1672531200000; // 2023-01-01T00:00:00.000Z
      const convertedData = converter.outbound.asDate(data);
      expect(convertedData.getTime()).toEqual(new Date("2023-01-01T00:00:00.000Z").getTime());
    })

    it("should convert back null date", () => {
      const data = null;
      const convertedData = converter.outbound.asDate(data);
      expect(convertedData).toBeNull()
    })

    it("should convert back to connection", () => {
      const data = 5;
      const convertedData = converter.outbound.asConnection(data);
      expect(convertedData).toEqual(5);
    })

    it("should convert in all fields", () => {
      const schema = {
        test: "string",
        test2: "integer",
        test3: "float",
        test4: "boolean",
        test5: "date",
      } as const

      const data = {
        test: "test",
        test2: 5.5,
        test3: 5.57,
        test4: true,
        test5: new Date("2023-01-01T00:00:00.000Z"),
      }

      const convertedData = converter.inbound.convert(data, schema);

      expect(convertedData).toEqual({
        test: "test",
        test2: 5,
        test3: 5.57,
        test4: 1,
        test5: new Date("2023-01-01T00:00:00.000Z").getTime(),
      })

      const data2 = {
        test: "test",
        test2: 5,
        test3: 5.57,
        test4: false,
        test5: new Date("2023-01-02T00:00:00.000Z"),
      }

      const convertedData2 = converter.inbound.convert(data2, schema);

      expect(convertedData2).toEqual({
        test: "test",
        test2: 5,
        test3: 5.57,
        test4: 0,
        test5: new Date("2023-01-02T00:00:00.000Z").getTime(),
      })
    })

    it("should convert back all fields", () => {
      const data = {
        test: "test",
        test2: 5,
        test3: 5.5,
        test4: 1,
        test5: 1672531200000, // 2023-01-01T00:00:00.000Z
      }

      const convertedData = converter.outbound.convert(data, {
        test: "string",
        test2: "integer",
        test3: "float",
        test4: "boolean",
        test5: "date",
      });

      expect(convertedData).toEqual({
        test: "test",
        test2: 5,
        test3: 5.5,
        test4: true,
        test5: expect.any(Date),
      })

      expect(convertedData.test5.getTime()).toEqual(new Date("2023-01-01T00:00:00.000Z").getTime())
    })
  });
});