const tfxjs = require("./lib/index");
const tfx = new tfxjs(__dirname + "/.acceptance_tests/defaults", "ibmcloud_api_key");

tfx.plan("LandingZone", () => {
  tfx.module("Root Module", "module.landing_zone", [
    {
      name: "Activity Tracker Route",
      address: "ibm_atracker_route.atracker_route",
      values: {
        name: "ut-atracker-route",
        receive_global_events: true,
      },
    },
  ]);
  tfx.module("Key Management Module", "module.key_management", [])
});

