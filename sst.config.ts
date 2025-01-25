/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "chris-site",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "eu-west-2",
        },
      },
    };
  },
  async run() {
    const bucket = new sst.aws.Bucket("chris-tregaskis.uk");

    new sst.aws.StaticSite("ChrisSite", {
      path: ".", // The React app is in the root directory
      build: {
        command: "pnpm run build",
        output: "dist",
      },
      domain: {
        name: "chris-tregaskis.uk",
        redirects: ["www.chris-tregaskis.uk"],
      },
      environment: {
        BUCKET_NAME: bucket.name,
        VITE_CHRIS_API:
          "https://vqgeoqavcnpupyoia5orhpfwfu0ziksm.lambda-url.eu-west-2.on.aws",
      },
    });

    return {};
  },
});
