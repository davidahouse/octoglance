const chalk = require("chalk");
const moment = require("moment");

/**
 * organizations command
 * @param {*} org
 * @param {*} repo
 * @param {*} octokit
 * @param {*} callback
 */
async function handle(org, repo, octokit, callback) {
  const repos = await repositoryList(org, repo, octokit);
  const collaborators = {};

  for (let index = 0; index < repos.length; index++) {
    let org = repos[index].org;
    let repo = repos[index].repo;
    const collab = await octokit.repos.listCollaborators({
      owner: org,
      repo: repo,
    });
    if (collab.data != null) {
      for (let cindex = 0; cindex < collab.data.length; cindex++) {
        const login = collab.data[cindex].login;
        if (collaborators[login] == null) {
          collaborators[login] = [{ org: org, repo: repo }];
        } else {
          collaborators[login].push({ org: org, repo: repo });
        }
      }
    }
  }

  Object.keys(collaborators).forEach(function (name) {
    console.log(chalk.green(name));
    for (let index = 0; index < collaborators[name].length; index++) {
      console.log(
        chalk.yellow(
          collaborators[name][index].org + " " + collaborators[name][index].repo
        )
      );
    }
  });
  callback();
}

async function repositoryList(org, repo, octokit) {
  if (org == null || org === "user") {
    const userreposoptions = await octokit.repos.list.endpoint.merge({
      type: "owner",
    });

    const result = [];
    for await (const response of octokit.paginate.iterator(userreposoptions)) {
      for (let index = 0; index < response.data.length; index++) {
        result.push({
          org: response.data[index].owner.login,
          repo: response.data[index].name,
        });
      }
    }
    return result;
  } else if (repo == null) {
    const result = [];
    const repos = await octokit.repos.listForOrg({
      org: org,
    });
    if (repos != null && repos.data != null) {
      for (let index = 0; index < repos.data.length; index++) {
        result.push({ org: org, repo: repos.data[index].name });
      }
    }
    return result;
  } else {
    return [{ org: org, repo: repo }];
  }
}

module.exports.handle = handle;
