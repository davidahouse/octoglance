const chalk = require("chalk");
const moment = require("moment");

/**
 * organizations command
 * @param {*} org
 * @param {*} octokit
 * @param {*} scope
 * @param {*} callback
 */
async function handle(org, scope, octokit, callback) {
  // Handle personal repos if org is null
  let releases = [];

  if (org == null || org === "user") {
    const userreposoptions = await octokit.repos.list.endpoint.merge({
      type: "owner",
    });

    for await (const response of octokit.paginate.iterator(userreposoptions)) {
      // do whatever you want with each response, break out of the loop, etc.
      for (let index = 0; index < response.data.length; index++) {
        const foundReleases = await gatherReleases(
          response.data[index].owner.login,
          response.data[index].name,
          scope,
          octokit
        );

        releases.push(...foundReleases);
      }
    }
  } else {
    const repos = await octokit.repos.listForOrg({
      org: org,
    });
    if (repos != null && repos.data != null) {
      for (let index = 0; index < repos.data.length; index++) {
        const foundReleases = await gatherReleases(
          org,
          response.data[index].name,
          scope,
          octokit
        );
        releases.push(...foundReleases);
      }
    }
  }

  const sortedReleases = releases.sort(function (a, b) {
    if (a.created_at < b.created_at) {
      return -1;
    } else if (a.created_at > b.created_at) {
      return 1;
    } else {
      return 0;
    }
  });
  for (let index = 0; index < sortedReleases.length; index++) {
    console.log(
      chalk.green(
        sortedReleases[index].org + " / " + sortedReleases[index].repo
      )
    );
    console.log(
      chalk.green(
        sortedReleases[index].release + " " + sortedReleases[index].created_at
      )
    );
    console.log(chalk.yellow(sortedReleases[index].body));
  }

  callback();
}

async function gatherReleases(org, repo, scope, octokit) {
  const found = [];
  const releases = await octokit.repos.listReleases.endpoint.merge({
    owner: org,
    repo: repo,
  });
  for await (const response of octokit.paginate.iterator(releases)) {
    for (let index = 0; index < response.data.length; index++) {
      if (
        scope == null ||
        moment(new Date()).isSame(
          Date.parse(response.data[index].created_at),
          scope
        ) == true ||
        (scope === "week" &&
          moment(new Date()).week() ==
            moment(Date.parse(response.data[index].created_at)).week() &&
          moment(new Date()).year() ==
            moment(Date.parse(response.data[index].created_at)).year()) ||
        (scope === "lastYear" &&
          moment(new Date())
            .subtract(1, "year")
            .isSame(Date.parse(response.data[index].created_at), "year") ==
            true) ||
        (scope === "recent" &&
          moment(new Date()).diff(
            moment(Date.parse(response.data[index].created_at)),
            "days"
          ) <= 10)
      ) {
        found.push({
          org: org,
          repo: repo,
          release: response.data[index].name,
          tag: response.data[index].tag_name,
          body: response.data[index].body,
          created_at: response.data[index].created_at,
        });
      }
    }
  }
  return found;
}

module.exports.handle = handle;
