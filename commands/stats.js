const chalk = require("chalk");
const moment = require("moment");

/**
 * organizations command
 * @param {*} org
 * @param {*} scope
 * @param {*} octokit
 * @param {*} callback
 */
async function handle(org, scope, octokit, callback) {
  let repositoryCount = 0;
  let releaseCount = 0;
  let prCreateCount = 0;
  let prClosedCount = 0;
  let issueCreateCount = 0;
  let issueClosedCount = 0;

  // Handle personal repos if org is null
  if (org == null || org === "user") {
    const userreposoptions = await octokit.repos.list.endpoint.merge({
      type: "owner",
    });

    for await (const response of octokit.paginate.iterator(userreposoptions)) {
      // do whatever you want with each response, break out of the loop, etc.
      for (let index = 0; index < response.data.length; index++) {
        const org = response.data[index].owner.login;
        const repo = response.data[index].name;
        const repoStats = await gatherStats(org, repo, scope, octokit);
        releaseCount += repoStats.releases.published;
        prCreateCount += repoStats.pullRequests.created;
        prClosedCount += repoStats.pullRequests.closed;
        issueCreateCount += repoStats.issues.created;
        issueClosedCount += repoStats.issues.closed;
        repositoryCount += 1;
      }
    }
  } else {
    const repos = await octokit.repos.listForOrg({
      org: org,
    });
    if (repos != null && repos.data != null) {
      for (let index = 0; index < repos.data.length; index++) {
        const repo = repos.data[index].name;
        const repoStats = await gatherStats(org, repo, scope, octokit);
        releaseCount += repoStats.releases.published;
        prCreateCount += repoStats.pullRequests.created;
        prClosedCount += repoStats.pullRequests.closed;
        issueCreateCount += repoStats.issues.created;
        issueClosedCount += repoStats.issues.closed;
        repositoryCount += 1;
      }
    }
  }

  console.log(chalk.yellow("Repositories: ") + chalk.green(repositoryCount));
  console.log(chalk.yellow("Releases: ") + chalk.green(releaseCount));
  console.log(
    chalk.yellow("Pull Requests Created: ") + chalk.green(prCreateCount)
  );
  console.log(
    chalk.yellow("Pull Requests Closed: ") + chalk.green(prClosedCount)
  );
  console.log(chalk.yellow("Issues Created: ") + chalk.green(issueCreateCount));
  console.log(chalk.yellow("Issues Closed: ") + chalk.green(issueClosedCount));
  callback();
}

async function gatherStats(org, repo, scope, octokit) {
  const releases = await countReleases(org, repo, scope, octokit);
  const pullRequests = await countPullRequests(org, repo, scope, octokit);
  const issues = await countIssues(org, repo, scope, octokit);
  return {
    releases: releases,
    pullRequests: pullRequests,
    issues: issues,
  };
}

async function countReleases(org, repo, scope, octokit) {
  let totalPublished = 0;
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
            moment(Date.parse(response.data[index].created_at)).week()) ||
        (scope === "lastYear" &&
          moment(new Date())
            .subtract(1, "year")
            .isSame(Date.parse(response.data[index].created_at), "year") ==
            true)
      ) {
        totalPublished += 1;
      }
    }
  }
  return {
    published: totalPublished,
  };
}

async function countPullRequests(org, repo, scope, octokit) {
  let totalCreated = 0;
  let totalClosed = 0;
  const prs = await octokit.pulls.list.endpoint.merge({
    owner: org,
    repo: repo,
    state: "all",
  });
  for await (const response of octokit.paginate.iterator(prs)) {
    for (let index = 0; index < response.data.length; index++) {
      if (
        scope == null ||
        moment(new Date()).isSame(
          Date.parse(response.data[index].created_at),
          scope
        ) == true ||
        (scope === "week" &&
          moment(new Date()).week() ==
            moment(Date.parse(response.data[index].created_at)).week()) ||
        (scope === "lastYear" &&
          moment(new Date())
            .subtract(1, "year")
            .isSame(Date.parse(response.data[index].created_at), "year") ==
            true)
      ) {
        totalCreated += 1;
      }

      if (response.data[index].closed_at != null) {
        if (
          scope == null ||
          moment(new Date()).isSame(
            Date.parse(response.data[index].closed_at),
            scope
          ) == true ||
          (scope === "week" &&
            moment(new Date()).week() ==
              moment(Date.parse(response.data[index].created_at)).week()) ||
          (scope === "lastYear" &&
            moment(new Date())
              .subtract(1, "year")
              .isSame(Date.parse(response.data[index].created_at), "year") ==
              true)
        ) {
          totalClosed += 1;
        }
      }
    }
  }
  return {
    created: totalCreated,
    closed: totalClosed,
  };
}

async function countIssues(org, repo, scope, octokit) {
  let totalCreated = 0;
  let totalClosed = 0;
  const issues = await octokit.issues.listForRepo.endpoint.merge({
    owner: org,
    repo: repo,
    state: "all",
  });
  for await (const response of octokit.paginate.iterator(issues)) {
    for (let index = 0; index < response.data.length; index++) {
      if (response.data[index].pull_request == null) {
        if (
          scope == null ||
          moment(new Date()).isSame(
            Date.parse(response.data[index].created_at),
            scope
          ) == true ||
          (scope === "week" &&
            moment(new Date()).week() ==
              moment(Date.parse(response.data[index].created_at)).week()) ||
          (scope === "lastYear" &&
            moment(new Date())
              .subtract(1, "year")
              .isSame(Date.parse(response.data[index].created_at), "year") ==
              true)
        ) {
          totalCreated += 1;
        }

        if (response.data[index].closed_at != null) {
          if (
            scope == null ||
            moment(new Date()).isSame(
              Date.parse(response.data[index].closed_at),
              scope
            ) == true ||
            (scope === "week" &&
              moment(new Date()).week() ==
                moment(Date.parse(response.data[index].created_at)).week()) ||
            (scope === "lastYear" &&
              moment(new Date())
                .subtract(1, "year")
                .isSame(Date.parse(response.data[index].created_at), "year") ==
                true)
          ) {
            totalClosed += 1;
          }
        }
      }
    }
  }
  return {
    created: totalCreated,
    closed: totalClosed,
  };
}

module.exports.handle = handle;
