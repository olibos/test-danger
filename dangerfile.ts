import {
  danger,
  fail,
  message,
  schedule,
  warn,
} from 'danger';

const modifiedMD = danger.git.modified_files.join("\n- ")
message("Changed Files in this PR: \n- " + modifiedMD);

message(`Head: ${danger.github.pr.head.ref}\nBase: ${danger.github.pr.base.ref}\nTitle: ${danger.github.pr.title}`);
if (!danger.github.pr.assignee) {
  fail("This pull request needs an assignee, and optionally include any reviewers.")
}

if (danger.github.pr.body.length < 10) {
  fail("This pull request needs a description.")
}

const hasPackageChanges = danger.git.modified_files.includes("package.json")
const hasLockfileChanges = danger.git.modified_files.includes("yarn.lock")
if (hasPackageChanges && !hasLockfileChanges) {
  warn("There are package.json changes with no corresponding lockfile changes")
}

const blacklist = "jquery"

schedule(async () => {
  const packageDiff = await danger.git.JSONDiffForFile("package.json")

  if (packageDiff.dependencies) {
      const newDependencies = packageDiff.dependencies.added
      if (newDependencies?.includes(blacklist)) {
        fail(`Do not add ${blacklist} to our dependencies, see CVE #23"`);
      }
  }
});