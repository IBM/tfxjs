const { assert } = require("chai");
const builders = require("../lib/builders");
<<<<<<< HEAD
=======
const mocks = require("./tfx.mocks");
const sinon = require("sinon");
let mock = new mocks();
>>>>>>> intern-tfxjs/master

describe("builders", () => {
  const mochaTest = builders.mochaTest;
  describe("mochaTest", () => {
    describe("init", () => {
      it("should initialize correctly with no args", () => {
        let testInstance = new mochaTest();
        assert.deepEqual(testInstance.name, "", "it should have default name");
        assert.deepEqual(
          testInstance.assertionType,
          "",
          "it should have default type"
        );
        assert.deepEqual(
          testInstance.assertionArgs,
          [],
          "it should have default args"
        );
      });
    });
    describe("send", () => {
      it("should return the correct object when send is called", () => {
        let testInstance = new mochaTest();
<<<<<<< HEAD
=======
        testInstance.send();
>>>>>>> intern-tfxjs/master
        let sendData = testInstance.send();
        let expectedData = {
          name: "",
          assertionType: "",
          assertionArgs: [],
        };
        assert.deepEqual(
          sendData,
          expectedData,
          "it should return the correct object"
        );
      });
    });
  });
  describe("notFalseTest", () => {
    it("should return the correct test", () => {
      let testData = builders.notFalseTest("test", [1, 2, 3]);
      let expectedData = {
        name: "test",
        assertionType: "isNotFalse",
        assertionArgs: [1, 2, 3],
      };
      assert.deepEqual(
        testData,
        expectedData,
        "it should return the correct data"
      );
    });
  });
  describe("isTrueTest", () => {
    it("should return the correct test", () => {
      let testData = builders.isTrueTest("test", [1, 2, 3]);
      let expectedData = {
        name: "test",
        assertionType: "isTrue",
        assertionArgs: [1, 2, 3],
      };
      assert.deepEqual(
        testData,
        expectedData,
        "it should return the correct data"
      );
    });
  });
  describe("deepEqualTest", () => {
    it("should return the correct test", () => {
      let testData = builders.deepEqualTest("test", [1, 2, 3]);
      let expectedData = {
        name: "test",
        assertionType: "deepEqual",
        assertionArgs: [1, 2, 3],
      };
      assert.deepEqual(
        testData,
        expectedData,
        "it should return the correct data"
      );
    });
  });
  describe("eachKeyTest", () => {
    let eachKeyTest = builders.eachKeyTest;
<<<<<<< HEAD
=======

>>>>>>> intern-tfxjs/master
    it("should run value test against a function if the value is a function", () => {
      let data = eachKeyTest(
        "address",
        {
          value: (value) => {
            return {
              expectedData: value === "test",
              appendMessage: "append",
            };
          },
        },
        { value: "test" },
        "plan",
        "test"
      );
      let expectedData = [
        {
          name: "test should have the correct value value",
          assertionType: "isTrue",
          assertionArgs: [true, "Expected address resource value value append"],
        },
      ];
      assert.deepEqual(data, expectedData, "it should return correct object");
    });
    it("should run a notFalseTest for unfound keys", () => {
      let actualData = eachKeyTest(
        "test",
        { test: "data" },
        {},
        "apply",
        "test",
        0
      );
      let expectedData = [
        {
          name: "Expected resource test[0] to have correct value for test[0].test",
          assertionType: "isNotFalse",
          assertionArgs: [
            false,
            "Expected test[0] attribute test.test to exist",
          ],
        },
      ];
<<<<<<< HEAD
      assert.deepEqual(actualData, expectedData);
=======
      assert.deepEqual(actualData, expectedData, "should return expected data");
>>>>>>> intern-tfxjs/master
    });
  });
  describe("valueTest", () => {
    let valueTest = builders.valueTest;
    it("should return the correct test if a valid valueFunction is passed", () => {
      let actualData = valueTest(
        (value) => {
          return {
            expectedData: true,
            appendMessage: "append",
          };
        },
        { data: true },
        "testName",
        "testMessage"
      );
      let expectedData = {
        name: "testName",
        assertionType: "isTrue",
        assertionArgs: [true, "testMessage append"],
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct test"
      );
    });
  });
  describe("eval", () => {
    let eval = builders.eval;
    it("should return a function", () => {
      assert.isTrue(
        eval("test", () => {}) instanceof Function,
        "it should return funciton"
      );
    });
    it("should evaluate the function when run", () => {
      let actualData = eval("test", () => {
        return true;
      })();
      let expectedData = {
        appendMessage: "test",
        expectedData: true,
      };
      assert.deepEqual(actualData, expectedData, "it should return value");
    });
  });
  describe("resource", () => {
    let resource = builders.resource;
    it("should return the correct object", () => {
      let actualData = resource("test", "test", {});
<<<<<<< HEAD
      assert.deepEqual(actualData, {
        name: "test",
        address: "test",
        values: {},
      });
=======
      assert.deepEqual(
        actualData,
        {
          name: "test",
          address: "test",
          values: {},
        },
        "should return expected data"
      );
>>>>>>> intern-tfxjs/master
    });
  });
  describe("address", () => {
    let address = builders.address;
    it("should return instances", () => {
      let actualData = address("test", { id: true });
      let expectedData = {
        address: "test",
        instances: [
          {
            id: true,
          },
        ],
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("textTemplate", () => {
    let textTemplate = builders.textTemplate;
    const resourceTemplate = `tfx.resource(\n  "$RESOURCE_NAME",\n  "$RESOURCE_ADDRESS",\n$VALUES\n),`;
    it("should get all the args from a string teplate and set as templateArgs", () => {
      let expectedData = ["$RESOURCE_NAME", "$RESOURCE_ADDRESS", "$VALUES"];
      let actualData = new textTemplate(resourceTemplate).templateArgs;
      assert.deepEqual(actualData, expectedData, "should have correct array");
    });
    describe("fill", () => {
      it("should fill the template variable values", () => {
        let expectedData = `tfx.resource(\n  "yes",\n  "hi",\nhello\n),`;
        let actualData = new textTemplate(resourceTemplate).fill(
          "yes",
          "hi",
          "hello"
        );
        assert.deepEqual(
          actualData,
          expectedData,
          "It should return filled in template"
        );
      });
    });
    describe("set", () => {
      it("should replace a value and return the object", () => {
        let expectedData = `tfx.resource(\n  "$RESOURCE_NAME",\n  "$RESOURCE_ADDRESS",\nhi\n),`;
        let actualData = new textTemplate(resourceTemplate).set(
          "$VALUES",
          "hi"
        );
        assert.deepEqual(
          actualData,
          expectedData,
          "should return string template"
        );
      });
    });
    describe("clone", () => {
      it("should create a new instance of the textTemplate instance", () => {
        let original = new textTemplate(resourceTemplate);
        let cloneTemplate = original.clone();
<<<<<<< HEAD
        assert.deepEqual(original.str, cloneTemplate.str, "it should copy")
      })
      it("should not change the original when the clone is changed", () => {
        let original = new textTemplate(resourceTemplate);
        let cloneTemplate = original.clone();
        cloneTemplate.set("$VALUES", "frog")
        assert.notDeepEqual(original.str, cloneTemplate.str, "it should copy")
      })
    })
=======
        assert.deepEqual(original.str, cloneTemplate.str, "it should copy");
      });
      it("should not change the original when the clone is changed", () => {
        let original = new textTemplate(resourceTemplate);
        let cloneTemplate = original.clone();
        cloneTemplate.set("$VALUES", "frog");
        assert.notDeepEqual(original.str, cloneTemplate.str, "it should copy");
      });
    });
  });
  describe("connect", () => {
    let connect = builders.connect;
    it("should call and run doesConnect tcp test from connect with a connection package", () => {
      let mockConnect = function (connectionPackages) {
        this.test = "hello";
      };
      let connectionTests = new connect(mockConnect, {});
      connectionTests.connectionTests.tcpTest = new sinon.spy();
      connectionTests.tcp.doesConnect("host", 8080);
      assert.isTrue(
        connectionTests.connectionTests.tcpTest.calledOnceWith("host", 8080)
      );
    });
    it("should call and run tcp test from connect with a connection package", () => {
      let mockConnect = function (connectionPackages) {
        this.test = "hello";
      };
      let connectionTests = new connect(mockConnect, {});
      connectionTests.connectionTests.tcpTest = new sinon.spy();
      connectionTests.tcp.doesNotConnect("host", 8080);
      assert.isTrue(
        connectionTests.connectionTests.tcpTest.calledOnceWith(
          "host",
          8080,
          true
        )
      );
    });

    it("should call and run doesConnect udp test from connect with a connection package", () => {
      let mockConnect = function (connectionPackages) {
        this.test = "hello";
      };
      let connectionTests = new connect(mockConnect, {});
      connectionTests.connectionTests.udpTest = new sinon.spy();
      connectionTests.udp.doesConnect("host", 8080);
      assert.isTrue(
        connectionTests.connectionTests.udpTest.calledOnceWith("host", 8080, false)
      );
    });
    it("should call and run doesNotConnect udp test from connect with a connection package", () => {
      let mockConnect = function (connectionPackages) {
        this.test = "hello";
      };
      let connectionTests = new connect(mockConnect, {});
      connectionTests.connectionTests.udpTest = new sinon.spy();
      connectionTests.udp.doesNotConnect("host", 8080);
      assert.isTrue(
        connectionTests.connectionTests.udpTest.calledOnceWith(
          "host",
          8080,
          true
        )
      );
    });

    it("should call and run doesConnect ping test from connect with a connection package", () => {
      let mockConnect = function (connectionPackages) {
        this.test = "hello";
      };
      let connectionTests = new connect(mockConnect, {});
      connectionTests.connectionTests.pingTest = new sinon.spy();
      connectionTests.ping.doesConnect("host");
      assert.isTrue(
        connectionTests.connectionTests.pingTest.calledOnceWith("host")
      );
    });
    it("should call and run doesNotConnect ping test from connect with a connection package", () => {
      let mockConnect = function (connectionPackages) {
        this.test = "hello";
      };
      let connectionTests = new connect(mockConnect, {});
      connectionTests.connectionTests.pingTest = new sinon.spy();
      connectionTests.ping.doesNotConnect("host");
      assert.isTrue(
        connectionTests.connectionTests.pingTest.calledOnceWith(
          "host",
          true
        )
      );
    });

    it("should call and run doesConnect ssh test from connect with a connection package", () => {
      let mockConnect = function (connectionPackages) {
        this.test = "hello";
      };
      let connectionTests = new connect(mockConnect, {});
      connectionTests.connectionTests.sshTest = new sinon.spy();
      connectionTests.ssh.doesConnect("host", "username", "privateKey");
      assert.isTrue(
        connectionTests.connectionTests.sshTest.calledOnceWith("host", "username", "privateKey")
      );
    });
    it("should call and run doesNotConnect ssh test from connect with a connection package", () => {
      let mockConnect = function (connectionPackages) {
        this.test = "hello";
      };
      let connectionTests = new connect(mockConnect, {});
      connectionTests.connectionTests.sshTest = new sinon.spy();
      connectionTests.ssh.doesNotConnect("host", "username", "privateKey");
      assert.isTrue(
        connectionTests.connectionTests.sshTest.calledOnceWith(
          "host",
          "username",
          "privateKey",
          true
        )
      );
    });


>>>>>>> intern-tfxjs/master
  });
});
