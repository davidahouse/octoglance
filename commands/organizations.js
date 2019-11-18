const chalk = require("chalk");

/**
 * organizations command
 * @param {*} octokit
 * @param {*} callback
 */
async function handle(octokit, callback) {
  const user = await octokit.users.getAuthenticated();
  if (user != null && user.data != null) {
    console.log(chalk.yellow(user.data.login));
  }

  const orgs = await octokit.orgs.listForAuthenticatedUser();
  if (orgs != null && orgs.data != null) {
    for (let index = 0; index < orgs.data.length; index++) {
      console.log(chalk.yellow(orgs.data[index].login));
    }
  }
  callback();
}

module.exports.handle = handle;
