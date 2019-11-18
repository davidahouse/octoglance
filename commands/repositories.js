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
    console.log(chalk.green("Your Repositories:"));
    const userreposoptions = await octokit.repos.list.endpoint.merge({
      type: "owner"
    });

    for await (const response of octokit.paginate.iterator(userreposoptions)) {
      // do whatever you want with each response, break out of the loop, etc.
      for (let index = 0; index < response.data.length; index++) {
        console.log(chalk.yellow(response.data[index].name));
      }
    }
  } else {
    console.log(chalk.green(org + " Repositories:"));
    const repos = await octokit.repos.listForOrg({
      org: org
    });
    if (repos != null && repos.data != null) {
      for (let index = 0; index < repos.data.length; index++) {
        console.log(chalk.yellow(repos.data[index].name));
      }
    }
  }

  callback();
}

module.exports.handle = handle;
