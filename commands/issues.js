const chalk = require("chalk");
const moment = require("moment");

/**
 * organizations command
 * @param {*} org
 * @param {*} octokit
 * @param {*} callback
 */
async function handle(org, octokit, callback) {
  // Handle personal repos if org is null
  let issues = [];

  if (org == null || org === "user") {
    const userreposoptions = await octokit.repos.list.endpoint.merge({
      type: "owner",
    });

    for await (const response of octokit.paginate.iterator(userreposoptions)) {
      // do whatever you want with each response, break out of the loop, etc.
      for (let index = 0; index < response.data.length; index++) {
        const foundIssues = await gatherIssues(
          response.data[index].owner.login,
          response.data[index].name,
          octokit
        );

        if (foundIssues.length > 0) {
          issues.push({
            org: response.data[index].owner.login,
            repo: response.data[index].name,
            issues: foundIssues,
          });
        }
      }
    }
  } else {
    const repos = await octokit.repos.listForOrg({
      org: org,
    });
    if (repos != null && repos.data != null) {
      for (let index = 0; index < repos.data.length; index++) {
        const foundIssues = await gatherReleases(
          org,
          response.data[index].name,
          octokit
        );

        if (foundIssues.length > 0) {
          issues.push({
            org: response.data[index].owner.login,
            repo: response.data[index].name,
            issues: foundIssues,
          });
        }
      }
    }
  }

  for (let index = 0; index < issues.length; index++) {
    console.log(chalk.green(issues[index].org + " / " + issues[index].repo));
    for (let x = 0; x < issues[index].issues.length; x++) {
      console.log(
        chalk.yellow(
          issues[index].issues[x].number + " - " + issues[index].issues[x].title
        )
      );
    }
  }

  callback();
}

async function gatherIssues(org, repo, octokit) {
  const found = [];
  const issues = await octokit.issues.listForRepo.endpoint.merge({
    owner: org,
    repo: repo,
  });
  for await (const response of octokit.paginate.iterator(issues)) {
    for (let index = 0; index < response.data.length; index++) {
      if (response.data[index].pull_request == null) {
        found.push({
          org: org,
          repo: repo,
          number: response.data[index].number,
          title: response.data[index].title,
          created_at: response.data[index].created_at,
        });
      }
    }
  }
  return found;
}

module.exports.handle = handle;
