#!/usr/bin/env node
const chalk = require("chalk");
const figlet = require("figlet");
const vorpal = require("vorpal")();
const Octokit = require("@octokit/rest");
const settings = require("settings-store");

// General commands
const organizations = require("../commands/organizations");
const repositories = require("../commands/repositories");
const unreleased = require("../commands/unreleased");

require("pkginfo")(module);
const conf = require("rc")("octoglance", {
  // defaults
  githubAPIKey: null,
  gheAPIKey: null,
  gheHost: null
});

settings.init({
  appName: "octoglance", //required,
  reverseDNS: "com.davidahouse.octoglance" //required for macOS
});

let octokit = null;

if (settings.value("github", "public") === "public") {
  octokit = new Octokit({
    auth: conf.githubAPIKey,
    userAgent: "octokit/rest.js v1.2.3",
    log: {
      warn: console.warn,
      error: console.error
    }
  });
} else {
  octokit = new Octokit({
    auth: conf.githubAPIKey,
    userAgent: "octokit/rest.js v1.2.3",
    log: {
      warn: console.warn,
      error: console.error
    }
  });
}

console.log(
  chalk.yellow(figlet.textSync("octoglance", { horizontalLayout: "full" }))
);
console.log(chalk.yellow(module.exports.version));

// General
vorpal
  .command("set", "List the current settings")
  .action(function(args, callback) {
    vorpal.log("Current Organization: " + settings.value("currentOrg", "user"));
    vorpal.log("Current Repository: " + settings.value("currentRepo", "none"));
    callback();
  });

// Org

vorpal
  .command("orgs", "List the github orgs you are a member of")
  .action(function(args, callback) {
    organizations.handle(octokit, callback);
  });
vorpal
  .command("organizations", "List the github organizations you are a member of")
  .action(function(args, callback) {
    organizations.handle(octokit, callback);
  });
vorpal
  .command("org [name]", "List the github orgs you are a member of")
  .action(function(args, callback) {
    settings.setValue("currentOrg", args.name);
    settings.setValue("currentRepo", null);
    vorpal.log(
      "Current organzation has been set to: " +
        settings.value("currentOrg", "user")
    );
    vorpal.log("Current repository has been cleared");
    callback();
  });

// Repo

vorpal
  .command("repos", "List the github repos in the current organization")
  .action(function(args, callback) {
    repositories.handle(
      settings.value("currentOrg", "user"),
      octokit,
      callback
    );
  });
vorpal
  .command(
    "repositories",
    "List the github repositories in the current organization"
  )
  .action(function(args, callback) {
    repositories.handle(
      settings.value("currentOrg", "user"),
      octokit,
      callback
    );
  });
vorpal
  .command("repo [name]", "List the github orgs you are a member of")
  .action(function(args, callback) {
    settings.setValue("currentRepo", args.name);
    vorpal.log(
      "Current repository has been set to: " +
        settings.value("currentRepo", "none")
    );
    callback();
  });

// Milestones
vorpal
  .command(
    "unreleased",
    "List the github repositories that have unreleased milestones"
  )
  .action(function(args, callback) {
    unreleased.handle(settings.value("currentOrg", "user"), octokit, callback);
  });

vorpal.history("octoglance");
vorpal.delimiter("octoglance>").show();
