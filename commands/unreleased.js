const chalk = require("chalk");

/**
 * organizations command
 * @param {*} org
 * @param {*} octokit
 * @param {*} callback
 */
async function handle(org, octokit, callback) {
  // Handle personal repos if org is null
  if (org == null || org === "user") {
    const userreposoptions = await octokit.repos.list.endpoint.merge({
      type: "owner"
    });

    for await (const response of octokit.paginate.iterator(userreposoptions)) {
      // do whatever you want with each response, break out of the loop, etc.
      for (let index = 0; index < response.data.length; index++) {
        const milestones = await octokit.issues.listMilestonesForRepo({
          owner: response.data[index].owner.login,
          repo: response.data[index].name
        });
        for (let mindex = 0; mindex < milestones.data.length; mindex++) {
          if (
            milestones.data[mindex].title === "Unreleased" &&
            milestones.data[mindex].closed_issues > 0
          ) {
            console.log(
              chalk.green(
                "🚢" +
                  response.data[index].owner.login +
                  "/" +
                  response.data[index].name +
                  " " +
                  milestones.data[mindex].closed_issues +
                  " pr(s) ready to release"
              )
            );
          }
        }
      }
    }
  } else {
    console.log(chalk.green(org + " Unreleased:"));
    const repos = await octokit.repos.listForOrg({
      org: org
    });
    if (repos != null && repos.data != null) {
      for (let index = 0; index < repos.data.length; index++) {
        const milestones = await octokit.issues.listMilestonesForRepo({
          owner: org,
          repo: repos.data[index].name
        });
        for (let mindex = 0; mindex < milestones.data.length; mindex++) {
          if (
            milestones.data[mindex].title === "Unreleased" &&
            milestones.data[mindex].closed_issues > 0
          ) {
            console.log(
              chalk.green(
                "🚢" +
                  org +
                  "/" +
                  repos.data[index].name +
                  " " +
                  milestones.data[mindex].closed_issues +
                  " pr(s) ready to release"
              )
            );
          }
        }
      }
    }
  }

  callback();
}

module.exports.handle = handle;
