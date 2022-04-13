const tfxjs = require("./lib/index");
const tfx = new tfxjs(__dirname + "/.acceptance_tests/defaults", "ibmcloud_api_key");

tfx.apply("LandingZone", () => {
  console.log(tfx.tfstate)
  tfx.state("tfstate", [
    {
      name: "Cluster Versions",
      address: "module.landing_zone.data.ibm_container_cluster_versions.cluster_versions",
      instances: [
        {
          org_guid: null
        }
      ]
    }
  ])
});