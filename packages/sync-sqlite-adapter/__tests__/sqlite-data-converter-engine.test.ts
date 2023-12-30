import {SQLiteDataConverterEngine} from "../src/sqlite-data-converter-engine";

describe("Sqlite Data Converter Engine", () => {
  let converter: SQLiteDataConverterEngine = null;

  beforeEach(() => {
    converter = new SQLiteDataConverterEngine();
  });

  describe("Inbound Data Conversion", () => {
    describe("String Conversion", () => {
      it ("should convert string to string", () => {
        const data = "test";
        const convertedData = converter.inbound.toString(data);
        expect(convertedData).toEqual("test");
      })

      it("should convert int to string", () => {
        const data = 5;
        const convertedData = converter.inbound.toString(data);
        expect(convertedData).toEqual("5");
      })

      it("should convert float to string", () => {
        const data = 5.5;
        const convertedData = converter.inbound.toString(data);
        expect(convertedData).toEqual("5.5");
      })

      it("should convert boolean to string", () => {
        const data = true;
        const convertedData = converter.inbound.toString(data);
        expect(convertedData).toEqual("true");

      })

      it("should convert date to string", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.toString(data);
        expect(convertedData).toEqual("2023-01-01T00:00:00.000Z");
      })
    })

    describe("Int Conversion", () => {
      it("should convert string to int", () => {
        const data = "5.5";
        const convertedData = converter.inbound.toInt(data);
        expect(convertedData).toEqual(5);
      })

      it("should convert int to int", () => {
        const data = 5;
        const convertedData = converter.inbound.toInt(data);
        expect(convertedData).toEqual(5);
      })

      it("should convert float to int", () => {
        const data = 5.5;
        const convertedData = converter.inbound.toInt(data);
        expect(convertedData).toEqual(5);
      })

      it("should convert boolean to int", () => {
        const data = true;
        const convertedData = converter.inbound.toInt(data);
        expect(convertedData).toEqual(1);
      })

      it("should convert date to int", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.toInt(data);
        expect(convertedData).toEqual(1672531200000);
      })
    })

    describe("Float Conversion", () => {
      it("should convert string to int", () => {
        const data = "5.5";
        const convertedData = converter.inbound.toFloat(data);
        expect(convertedData).toEqual(5.5);
      })

      it("should convert int to float", () => {
        const data = 5;
        const convertedData = converter.inbound.toFloat(data);
        expect(convertedData).toEqual(5);
      })

      it("should convert float to float", () => {
        const data = 5.5;
        const convertedData = converter.inbound.toFloat(data);
        expect(convertedData).toEqual(5.5);
      })

      it("should convert boolean to float", () => {
        const data = true;
        const convertedData = converter.inbound.toFloat(data);
        expect(convertedData).toEqual(1);
      })

      it("should convert date to float", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.toFloat(data);
        expect(convertedData).toEqual(1672531200000);
      })
    })

    describe("Date Conversion", () => {
      it("should convert string to date", () => {
        const data = "2023-01-01T00:00:00.000Z";
        const convertedData = converter.inbound.toDate(data);
        expect(convertedData.getTime()).toEqual(new Date("2023-01-01T00:00:00.000Z").getTime());
      })

      it("should convert int to date", () => {
        const data = 1672531200000;
        const convertedData = converter.inbound.toDate(data);
        expect(convertedData.getTime()).toEqual(new Date("2023-01-01T00:00:00.000Z").getTime());
      })

      it("should convert float to date", () => {
        const data = 1672531200000.5;
        const convertedData = converter.inbound.toDate(data);
        expect(convertedData.getTime()).toEqual(new Date("2023-01-01T00:00:00.000Z").getTime());
      })

      it("should fail if try to convert boolean to date", () => {
        const data = true;
        const convertedData = converter.inbound.toDate(data);
        expect(convertedData).toBeUndefined();
      })

      it("should convert date to date", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.toDate(data);
        expect(convertedData.getTime()).toEqual(new Date("2023-01-01T00:00:00.000Z").getTime());
      })
    })

    describe("Boolean Conversion", () => {
      it("should convert string to boolean", () => {
        const data = "false";
        const convertedData = converter.inbound.toBoolean(data);
        expect(convertedData).toEqual(false);

        const data2 = "true";
        const convertedData2 = converter.inbound.toBoolean(data2);
        expect(convertedData2).toEqual(true);

        const data3 = "0";
        const convertedData3 = converter.inbound.toBoolean(data3);
        expect(convertedData3).toEqual(false);

        const data4 = "1";
        const convertedData4 = converter.inbound.toBoolean(data4);
        expect(convertedData4).toEqual(true);
      })

      it("should convert int to boolean", () => {
        const data = 5;
        const convertedData = converter.inbound.toBoolean(data);
        expect(convertedData).toEqual(true);

        const data2 = 0;
        const convertedData2 = converter.inbound.toBoolean(data2);
        expect(convertedData2).toEqual(false);
      })

      it("should convert float to boolean", () => {
        const data = 5.5;
        const convertedData = converter.inbound.toBoolean(data);
        expect(convertedData).toEqual(true);

        const data2 = 0.0;
        const convertedData2 = converter.inbound.toBoolean(data2);
        expect(convertedData2).toEqual(false);
      })

      it("should convert boolean to boolean", () => {
        const data = true;
        const convertedData = converter.inbound.toBoolean(data);
        expect(convertedData).toEqual(true);

        const data2 = false;
        const convertedData2 = converter.inbound.toBoolean(data2);
        expect(convertedData2).toEqual(false);
      })

      it("should convert date to boolean", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.toBoolean(data);
        expect(convertedData).toEqual(true);
      })
    })

    describe("Connection Conversion", () => {
      it("should convert string to connection", () => {
        const data = "test";
        const convertedData = converter.inbound.toConnection(data);
        expect(convertedData).toBeUndefined();

        const data2 = "0";
        const convertedData2 = converter.inbound.toConnection(data2);
        expect(convertedData2).toEqual(0);
      })

      it("should convert int to connection", () => {
        const data = 5;
        const convertedData = converter.inbound.toConnection(data);
        expect(convertedData).toEqual(5);
      })

      it("should convert float to connection", () => {
        const data = 5.5;
        const convertedData = converter.inbound.toConnection(data);
        expect(convertedData).toEqual(5);
      })

      it("should fail if try to convert boolean to connection", () => {
        const data = true;
        const convertedData = converter.inbound.toConnection(data);
        expect(convertedData).toBeUndefined();
      })

      it("should fail if try to convert date to connection", () => {
        const data = new Date("2023-01-01T00:00:00.000Z");
        const convertedData = converter.inbound.toConnection(data);
        expect(convertedData).toBeUndefined();
      })
    })
  });

  describe("Outbound Data Conversion", () => {
    it("should convert back to string", () => {
      const data = "test";
      const convertedData = converter.outbound.toString(data);
      expect(convertedData).toEqual("test");
    })

    it("should convert back to int", () => {
      const data = 5;
      const convertedData = converter.outbound.toInt(data);
      expect(convertedData).toEqual(5);
    })

    it("should convert back to float", () => {
      const data = 5.5;
      const convertedData = converter.outbound.toFloat(data);
      expect(convertedData).toEqual(5.5);
    })

    it("should convert back to boolean", () => {
      const data = 0;
      const convertedData = converter.outbound.toBoolean(data);
      expect(convertedData).toEqual(false);

      const data2 = 1;
      const convertedData2 = converter.outbound.toBoolean(data2);
      expect(convertedData2).toEqual(true);
    })

    it("should convert back to date", () => {
      const data = 1672531200000;
      const convertedData = converter.outbound.toDate(data);
      expect(convertedData.getTime()).toEqual(new Date("2023-01-01T00:00:00.000Z").getTime());
    })

    it("should convert back to connection", () => {
      const data = 5;
      const convertedData = converter.outbound.toConnection(data);
      expect(convertedData).toEqual(5);
    })
  });
});